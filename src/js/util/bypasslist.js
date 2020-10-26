export default class BypassList {
  constructor(app) {
    // Bindings
    this.init = this.init.bind(this);
    this.generatePingGateways = this.generatePingGateways.bind(this);
    this.updatePingGateways = this.updatePingGateways.bind(this);
    this.isRuleEnabled = this.isRuleEnabled.bind(this);
    this.popularRulesByName = this.popularRulesByName.bind(this);
    this.visibleSize = this.visibleSize.bind(this);
    this.restartProxy = this.restartProxy.bind(this);
    this.getUserRules = this.getUserRules.bind(this);
    this.setUserRules = this.setUserRules.bind(this);
    this.addUserRule = this.addUserRule.bind(this);
    this.removeUserRule = this.removeUserRule.bind(this);
    this.enablePopularRule = this.enablePopularRule.bind(this);
    this.disablePopularRule = this.disablePopularRule.bind(this);
    this.enabledPopularRules = this.enabledPopularRules.bind(this);
    this.toArray = this.toArray.bind(this);
    this.saveRulesToFile = this.saveRulesToFile.bind(this);
    this.importRules = this.importRules.bind(this);
    this.spawnImportTab = this.spawnImportTab.bind(this);

    // Init
    this.app = app;
    this.storage = app.util.storage;
    this.storageKeys = {
      userrk: 'bypasslist:customlist',
      poprk: 'bypasslist:popularrules',
    };

    this.enabledRules = new Map([
      [
        'privatenetworks', [
          '0.0.0.0/8',
          '10.0.0.0/8',
          '127.0.0.0/8',
          '169.254.0.0/16',
          '192.168.0.0/16',
          '172.16.0.0/12',
          '::1',
          'localhost',
          '*.local',
        ],
      ],
      ['pinggateways', this.generatePingGateways()],
      [this.storageKeys.userrk, []],
      [this.storageKeys.poprk, []],
    ]);

    this.netflixBypassRules = [
      'https://netflix.com',
      'https://*.netflix.com',
      'https://*.nflxvideo.net',
      'https://*.nflximg.net',
    ];

    this.huluBypassRules = [
      'https://*.hulu.com',
      'https://*.hulustream.com',
    ];

    this.popularRules = Object.freeze(new Map([
      ['netflix', this.netflixBypassRules],
      ['hulu', this.huluBypassRules],
    ]));
  }

  static trimUserRules(rules) {
    return rules
      .map((e) => {
        return e.trim();
      })
      .filter((e) => {
        return e.length > 0;
      });
  }

  init() {
    const { userrk, poprk } = this.storageKeys;
    if (this.storage.hasItem(userrk) && this.storage.getItem(userrk).length > 0) {
      this.setUserRules(this.storage.getItem(userrk).split(','));
    }

    if (this.storage.hasItem(poprk) && this.storage.getItem(poprk).length > 0) {
      this.storage.getItem(poprk).split(',').forEach((name) => {
        return this.enablePopularRule(name);
      });
    }
  }

  generatePingGateways() {
    const { util: { regionlist } } = this.app;
    const http = regionlist.toArray().map((r) => {
      return `http://${r.host}:8888`;
    });

    const https = regionlist.toArray().map((r) => {
      return `https://${r.host}:8888`;
    });

    return http.concat(https);
  }

  updatePingGateways() {
    this.enabledRules.set('pinggateways', this.generatePingGateways());
    if (this.app.proxy.enabled()) {
      this.app.proxy.enable();
    }
  }

  isRuleEnabled(ruleName) {
    return this.enabledRules.has(ruleName);
  }

  popularRulesByName() {
    return Array.from(this.popularRules.keys());
  }

  visibleSize() {
    return this.getUserRules().length + this.enabledPopularRules().length;
  }

  async restartProxy(cb = () => {}) {
    const { proxy } = this.app;
    if (!proxy) { throw new Error(debug('proxy not ready')); }
    if (proxy.enabled()) { await proxy.enable().then(cb); }
    else { await Promise.resolve(cb()); }
  }

  getUserRules() {
    return BypassList.trimUserRules(Array.from(this.enabledRules.get(this.storageKeys.userrk)));
  }

  setUserRules(rules) {
    this.storage.setItem(this.storageKeys.userrk, BypassList.trimUserRules(Array.from(rules)).join(','));
    this.enabledRules.set(this.storageKeys.userrk, rules);
    return this.getUserRules();
  }

  addUserRule(string, restartProxy = false) {
    let userString = string;
    if (userString.endsWith('/')) { userString = string.substring(0, string.length - 1); }
    const userRules = this.getUserRules();
    userRules.push(userString);
    this.setUserRules([...new Set(userRules)]);
    if (restartProxy) { this.restartProxy(); }
  }

  removeUserRule(string, restartProxy = false) {
    let userString = string;
    if (userString.endsWith('/')) { userString = string.substring(0, string.length - 1); }
    const rules = this.getUserRules();
    this.setUserRules(rules.filter((e) => { return e !== userString; }));
    if (restartProxy) { this.restartProxy(); }
  }

  enablePopularRule(name, restartProxy = true) {
    if (!this.popularRulesByName().includes(name)) {
      return Promise.reject(new Error(`${name} is not a valid popular rule`));
    }
    if (this.enabledPopularRules().includes(name)) { return Promise.resolve(); }

    return new Promise((resolve) => {
      const complete = () => {
        this.storage.setItem(this.storageKeys.poprk, this.enabledPopularRules().join(','));
        debug(`bypasslist: added ${name}`);
        resolve();
      };

      this.enabledRules.set(name, this.popularRules.get(name));

      if (restartProxy) { this.restartProxy(complete); }
      else { complete(); }
    });
  }

  disablePopularRule(name, restartProxy = true) {
    if (!this.popularRulesByName().includes(name)) {
      return Promise.reject(new Error(`${name} is not a valid popular rule`));
    }

    return new Promise((resolve, reject) => {
      const complete = () => {
        this.storage.setItem(this.storageKeys.poprk, this.enabledPopularRules().join(','));
        resolve();
        debug(`bypasslist: removed ${name}`);
      };
      if (this.enabledRules.has(name)) {
        this.enabledRules.delete(name);
        if (restartProxy) {
          this.restartProxy(complete);
        }
        else {
          complete();
        }
      }
      else { reject(new Error('rule not found')); }
    });
  }

  enabledPopularRules() {
    const enabledRulesByName = Array.from(this.enabledRules.keys());
    const popularRulesByName = this.popularRulesByName();
    return popularRulesByName.filter((name) => {
      return enabledRulesByName.includes(name);
    });
  }

  toArray() {
    const rules = [...Array.from(this.enabledRules.values())];
    return [].concat(...rules.map((r) => { return typeof r === 'function' ? r() : r; }));
  }

  /**
   * Create a file containing the current ruleset and download it on client
   *
   * @returns {void}
   */
  saveRulesToFile() {
    // Due to a bug in chromium, the chrome.downloads API will crash the browser
    // if used on the background script, present in Chromium 70 (unknown fix target).

    // Gitlab issue: https://codex.londontrustmedia.com/extension/pia_chrome/issues/81
    // Chromium bug: https://bugs.chromium.org/p/chromium/issues/detail?id=892133&can=1&q=extension%20downloads&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
    throw new Error('bypasslist.js: saveRulesToFile not available.');
    // const payload = JSON.stringify({
    //   popularRules: this.enabledPopularRules(),
    //   userRules: this.getUserRules(),
    // });
    // const file = new File('application/json', [payload]);
    // file.download('bypass-rules.json');
  }

  /**
   * Import the specified rule sets into the application
   *
   * @param {object} rules Set of rules to import
   * @returns {void}
   */
  importRules({ userRules, popularRules }) {
    const importRuleSet = (importedRules, getRules, enableRule, disableRule) => {
      if (Array.isArray(importedRules)) {
        // Disable rules not in importedRules
        getRules().forEach((rule) => {
          if (!importedRules.includes(rule)) { disableRule(rule); }
        });
        // Enable importedRules
        importedRules.forEach(enableRule);
      }
      // Disable all rules
      else if (typeof importedRules === 'undefined') {
        getRules().forEach(disableRule);
      }
      else { debug('rule set is invalid type, expected array'); }
    };
    try {
      importRuleSet(
        userRules,
        this.getUserRules,
        (name) => { return this.addUserRule(name, false); },
        (name) => { return this.removeUserRule(name, false); },
      );
      importRuleSet(
        popularRules,
        this.enabledPopularRules,
        (name) => { return this.enablePopularRule(name, false); },
        (name) => { return this.disablePopularRule(name, false); },
      );
      this.restartProxy();
    }
    catch (err) {
      debug(`failed to update rules with error: ${err}`);
    }
  }

  /**
   * Create a new popup window for importing rules file
   *
   * @returns {Promise<void>}
   */
  spawnImportTab() { // eslint-disable-line class-methods-use-this
    chrome.tabs.create({
      url: chrome.runtime.getURL('html/popups/importrules.html'),
    });
  }
}
