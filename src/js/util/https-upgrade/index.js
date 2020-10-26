/* eslint no-restricted-syntax: 0 */
import {
  ALARM_NAME,
  STORAGE_COUNT_KEY,
  LAST_UPDATED_KEY,
  LAST_TIMESTAMP_KEY,
  COUNTER_LIMIT,
} from '@data/https-upgrade';
import {
  getHostedRulesets,
  getStoredRulesets,
  setStoredRulesets,
  partsToTargetMap,
  getDefaultChannel,
  getTimestamp,
  applyRuleset,
} from './rulesets';

/**
 * HttpsUpgrade Utility
 *
 * Will handle fetching & updating rulesets used to upgrade requests to
 * https protocol for improved security
 */
class HttpsUpgrade {
  constructor(app) {
    // bind
    this.init = this.init.bind(this);
    this.enabled = this.enabled.bind(this);
    this.onAlarm = this.onAlarm.bind(this);
    this.attemptUpdate = this.attemptUpdate.bind(this);
    this.getPotentialRulesets = this.getPotentialRulesets.bind(this);
    this.onBeforeRequest = this.onBeforeRequest.bind(this);
    this.onCookieChanged = this.onCookieChanged.bind(this);
    this.onCompleted = this.onCompleted.bind(this);
    this.onErrorOccurred = this.onErrorOccurred.bind(this);
    this.onBeforeRedirect = this.onBeforeRedirect.bind(this);

    // init
    this.app = app;
    this.storage = app.util.storage;
    this.rulesets = new Map();
    this.rulesetsCache = new Map();
    this.counter = new Map();
    this.cookieCache = new Map();
    this.hrefBlacklist = new Set();
    this.updating = false;
    this.enabledTracker = false;
    this.upgradeToSecureAvailable = false;
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 30 });
    this.initializing = this.init();
  }

  /**
   * Perform all necessary async initialization
   *
   * These operations could complete at ANY time after HttpsUpgrade
   * is instantiated, therefore the class must continue to function
   * properly before this has completed, and as it is completing
   *
   */
  async init() {
    const initOps = [];
    // break scope to allow constructor to complete
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    /*              Populate rules
     * The update is represented by 6 time consuming stages
     * A - Fetch the most recent timestamp
     * B - Fetch the corresponding rules to timestamp
     * C - Extract the rules
     * D - Store the rules in storage
     * E - Fetch rules from storage
     * F - Process the rules
     *
     * Some stages are skipped depending on whether or not the
     * rules are stored or whether the timestamp has changed
     */
    const op1 = (async () => {
      let fromLocation;
      const start = performance.now();

      let parts = await this.attemptUpdate();
      if (parts) {
        fromLocation = 'hosted';
      }
      else {
        fromLocation = 'stored';
        const storageCount = this.storage.getItem(STORAGE_COUNT_KEY);
        parts = await getStoredRulesets(storageCount);

        // populate local rules (occurs in attemptUpdate)
        this.rulesetsCache.clear();
        this.rulesets = await partsToTargetMap(parts);
      }

      // calculate number of rules
      const numRules = parts.reduce((count, arr) => { return count + arr.length; }, 0);

      // debug info
      const end = performance.now();
      const duration = Math.floor(end - start);
      debug(`https-upgrade: populating ${numRules} ${fromLocation} rulesets took ${duration}ms`);
    })();
    initOps.push(op1);

    await Promise.all(initOps);
  }

  /**
   * Determine if the https-upgrade setting is enabled
   *
   * If this is not enabled, the various listeners should
   * not interfere/react when triggered. Also used for misc
   * cleanup after setting is disabled.
   */
  enabled() {
    const { app: { util: { settings } } } = this;
    const enabled = settings.isActive('httpsUpgrade');
    if (!enabled && this.enabledTracker) {
      this.counter.clear();
      this.cookieCache.clear();
    }
    this.enabledTracker = enabled;
    return enabled;
  }

  /**
   * Triggered when an alarm event occurs
   *
   * Attempt to update the rulesets
   */
  async onAlarm(alarm) {
    if (alarm.name === ALARM_NAME) {
      await this.attemptUpdate();
    }
    return undefined;
  }

  /**
   * Attempt to fetch rulesets and store in persistent storage
   *
   * Will only update if the hosted timestamp has changed
   */
  async attemptUpdate() {
    if (this.updating) {
      debug('https-upgrade: cancelling update, update already in progress');
      return false;
    }
    /**
     * performUpdate will actually update the rulesets, regardless
     * of the currently stored timestamp
     */
    const performUpdate = async (channel, timestamp) => {
      this.updating = true;
      try {
        debug('https-upgrade: updating rulesets');
        const oldCount = this.storage.getItem(STORAGE_COUNT_KEY);
        const parts = await getHostedRulesets(channel);
        this.rulesetsCache.clear();
        this.rulesets = await partsToTargetMap(parts);

        // set STORAGE_COUNT_KEY
        // in the event that the browser is closed BEFORE the timestamp is
        // updated, we still want to successfully cleanup any potential space
        const { length: count } = parts;
        this.storage.setItem(STORAGE_COUNT_KEY, count);

        // NOTE: if EU closes browser during this operation, we want
        // to always fetch the rulesets again
        await setStoredRulesets(parts, oldCount);

        // update timestamp only AFTER the operation completes successfully
        this.storage.setItem(LAST_TIMESTAMP_KEY, timestamp);
        this.storage.setItem(STORAGE_COUNT_KEY, count);
        this.storage.setItem(LAST_UPDATED_KEY, Date.now());
        this.updating = false;
        return parts;
      }
      catch (err) {
        this.updating = false;
        debug('https-upgrade: failed to update rulesets');
        debug(err.message || err);
        throw err;
      }
    };
    debug('https-upgrade: checking if update required');
    try {
      // get update channel
      const channel = getDefaultChannel();
      // get remote timestamp
      const timestamp = await getTimestamp(channel);
      // get local timestamp
      const lastTimestamp = this.storage.getItem(LAST_TIMESTAMP_KEY);
      // if no local timestamp (update has never occurred successfully), perform update
      if (!lastTimestamp) {
        return performUpdate(channel, timestamp);
      }
      // if timestamp has changed, perform update
      if (Number(timestamp) !== Number(lastTimestamp)) {
        return performUpdate(channel, timestamp);
      }
      // timestamp is up to date, do not update
      debug('https-upgrade: postponing https update');
      return false;
    }
    catch (err) {
      debug('https-upgrade: failed to update');
      debug(err.message || err);
      throw err;
    }
  }

  /**
   * Fetch the rulesets that might apply to a specific domain
   */
  getPotentialRulesets(domain) {
    const isValidDomain = (target) => {
      if (target.length <= 0) { return false; }
      if (target.length > 255) { return false; }
      if (target.includes('..')) { return false; }
      return true;
    };
    const getRulesets = (target) => {
      let rulesets = this.rulesetsCache.get(target);
      if (!rulesets) {
        rulesets = this.rulesets.get(target);
        this.rulesetsCache.set(target, rulesets);
      }
      return rulesets;
    };
    // example domain "x.y.z.domain.com"
    const results = new Set();
    if (isValidDomain(domain)) {
      // search for "x.y.z.domain.com"
      const exactMatches = getRulesets(domain);
      if (exactMatches) {
        exactMatches.forEach((exactMatch) => {
          results.add(exactMatch);
        });
      }

      // search for
      // "*.y.z.domain.com"
      // "*.z.domain.com"
      // "*.domain.com"
      const splits = domain.split('.');
      if (splits.length > 2) {
        const root = splits.slice(-2).join('.');
        let subdomains = splits.slice(0, -2);
        subdomains.push('');
        while (subdomains.length > 1) {
          subdomains = subdomains.slice(1);
          const target = `*.${subdomains.join('.')}${root}`;
          const matches = getRulesets(target);
          if (matches) {
            matches.forEach((match) => {
              results.add(match);
            });
          }
        }
      }
    }
    else {
      debug(`https-upgrade: invalid domain for rulesets "${domain}"`);
    }
    results.delete(undefined);
    return Array.from(results.values());
  }

  shouldSecureCookie(cookie) {
    let shouldSecure = false;
    let { domain } = cookie;
    if (this.cookieCache.size > 300) {
      this.cookieCache.delete(this.cookieCache.keys().next().value);
    }
    while (domain.charAt(0) === '.') {
      domain = domain.slice(1);
    }
    const potentialRules = this.getPotentialRulesets(domain);

    // check cache
    const cacheItem = this.cookieCache.get(domain);
    if (cacheItem) {
      shouldSecure = true;
    }
    // update cache
    else {
      const fakeUrl = `http://${domain}/${Math.random()}/${Math.random()}`;
      shouldSecure = !!potentialRules.find((ruleset) => {
        if (applyRuleset(ruleset, fakeUrl)) {
          this.cookieCache.set(domain, true);
          return true;
        }
        return false;
      });
      if (!shouldSecure) {
        this.cookieCache.set(domain, false);
      }
    }

    if (!shouldSecure) { return false; }
    return potentialRules
      .filter((ruleset) => { return ruleset.securecookie; })
      .find((ruleset) => {
        return ruleset.securecookie.find((cr) => {
          return !!(
            new RegExp(cr.host).test(cookie.domain)
            && new RegExp(cr.name).test(cookie.name)
          );
        });
      });
  }

  // ======================================== //
  //                Listeners                 //
  // ======================================== //

  /**
   * Upgrade url to https if a matching rule is found
   */
  onBeforeRequest(details) {
    if (this.enabled()) {
      let username = '';
      let password = '';
      if (!details.url) { return undefined; }
      const url = new URL(details.url);
      // Strip trailing '.'
      while (url.hostname.endsWith('.') && url.hostname.length > 1) {
        url.hostname = url.hostname.slice(0, url.hostname.length - 1);
      }
      if (url.username || url.password) {
        ({ username, password } = url);
        url.username = '';
        url.password = '';
      }
      if (this.hrefBlacklist.has(url.href)) {
        return undefined;
      }
      if (this.counter.get(details.requestId) >= COUNTER_LIMIT) {
        debug(`https-upgrade: blacklisting href "${url.href}"`);
        this.hrefBlacklist.add(url.href);
        return undefined;
      }
      const [matchedRuleset] = this.getPotentialRulesets(url.hostname);
      if (matchedRuleset) {
        let upgradedUrl = applyRuleset(matchedRuleset, url.href);
        if (!upgradedUrl) { return undefined; }
        if (username || password) {
          const withCredentials = new URL(upgradedUrl);
          withCredentials.username = username;
          withCredentials.password = password;
          upgradedUrl = withCredentials.href;
        }
        if (this.upgradeToSecureAvailable && upgradedUrl === details.url.replace(/^http:/, 'https:')) {
          debug(`https-upgrade: upgrading ${details.url} using upgradeToSecure API`);
          return { upgradeToSecure: true };
        }
        debug(`https-upgrade: redirecting ${details.url} to ${upgradedUrl}`);
        return { redirectUrl: upgradedUrl };
      }
    }

    return undefined;
  }

  /**
   * Secure insecure cookies
   */
  onCookieChanged(details) {
    if (this.enabled()) {
      const { cookie } = details;
      if (!details.removed && !cookie.secure && this.shouldSecureCookie(cookie)) {
        debug(`https-upgrade: attempting to secure cookie: ${cookie.name}`);
        const secureCookie = Object.assign(
          {
            name: cookie.name,
            value: cookie.value,
            path: cookie.path,
            httpOnly: cookie.httpOnly,
            expirationDate: cookie.expirationDate,
            storeId: cookie.storeId,
            secure: true,
          },
          cookie.hostOnly ? {} : { domain: cookie.domain },
          // https://tools.ietf.org/html/draft-west-first-party-cookies
          cookie.sameSite ? { sameSite: cookie.sameSite } : {},
          cookie.firstPartyDomain ? { firstPartyDomain: cookie.firstPartyDomain } : {},
          cookie.domain.startsWith('.')
            ? { url: `https://www${cookie.domain}${cookie.path}` }
            : { url: `https://${cookie.domain}${cookie.path}` },
        );
        chrome.cookies.set(secureCookie);
        debug(`https-upgrade: secured cookie "${cookie.name}" for "${cookie.domain}"`);
      }
    }
  }

  /**
   * Handle counter on request completion
   */
  onCompleted(details) {
    if (this.enabled()) {
      const { requestId } = details;
      if (this.counter.has(requestId)) {
        this.counter.delete(requestId);
        debug(`https-upgrade: clearing count for ${requestId}`);
      }
    }
  }

  /**
   * Handle counter on request error
   */
  onErrorOccurred(details) {
    if (this.enabled()) {
      if (this.counter.has(details.requestId)) {
        this.counter.delete(details.requestId);
      }
    }
  }

  /**
   * Handle counter for redirects (prevent looping)
   */
  onBeforeRedirect(details) {
    if (this.enabled()) {
      if (details.redirectUrl.match(/^https?:\/\/.*/)) {
        const { requestId } = details;
        const oldCount = HttpsUpgrade.parseCount(this.counter, requestId);
        this.counter.set(requestId, oldCount + 1);
        debug(`https-upgrade: increment count for ${requestId} to ${oldCount + 1}`);
      }
    }
  }

  // ======================================== //
  //                  Static                  //
  // ======================================== //

  static parseCount(counter, requestId) {
    const value = counter.get(requestId);
    if (typeof value === 'undefined') { return 0; }
    if (typeof value === 'number' && value >= 0) {
      return value;
    }
    debug(`https-upgrade: request count for ${requestId} invalid: ${value}`);
    return 0;
  }
}

export default HttpsUpgrade;
