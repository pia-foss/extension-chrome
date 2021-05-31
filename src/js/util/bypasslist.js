import { Type } from '@helpers/messagingFirefox';

export default class BypassList {
  constructor(app,foreground) {
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
    this.resetPopularRules = this.resetPopularRules.bind(this);
    this.importRules = this.importRules.bind(this);
    this.spawnImportTab = this.spawnImportTab.bind(this);
    this.getRulesSmartLoc = this.getRulesSmartLoc.bind(this);

    // Init
    this.app = app;
    this.foreground = foreground;
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

  resetPopularRules() {
    // turn off all popular rules
    this.popularRulesByName().map((rule) => {
      return this.disablePopularRule(rule, true);
    });

    // turn on popular and user rules from storage
    const { userrk, poprk } = this.storageKeys;
    if (this.storage.hasItem(poprk) && this.storage.getItem(poprk).length > 0) {
      this.storage.getItem(poprk).split(',').forEach((name) => {
        this.enablePopularRule(name, true);
      });
    }

    if (this.storage.hasItem(userrk)) {
      this.setUserRules(this.storage.getItem(userrk).split(','), true);
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

  setUserRules(rules, bridged) {
    const { adapter } = this.app;
    this.storage.setItem(this.storageKeys.userrk, BypassList.trimUserRules(Array.from(rules)).join(','));
    this.enabledRules.set(this.storageKeys.userrk, rules);
    if (!bridged && typeof browser != 'undefined') { adapter.sendMessage('setUserRules', rules); }
    return this.getUserRules();
  }

  getRulesSmartLoc(){
    const { helpers } = app;
    const bypassRules = this.enabledRules.get(this.storageKeys.userrk);

    const rules = bypassRules.map((v,k) => {
      if(helpers.UrlParser.parse(v)){
        return helpers.UrlParser.parse(v).domain
      }
    });
    return rules;
  };

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

  enablePopularRule(name, bridged, restartProxy = true) {
    if (!this.popularRulesByName().includes(name)) {
      return Promise.reject(new Error(`${name} is not a valid popular rule`));
    }
    if (this.enabledPopularRules().includes(name)) { return Promise.resolve(); }

    const { adapter } = this.app;

    return new Promise((resolve) => {
      // enable rule
      this.enabledRules.set(name, this.popularRules.get(name));

      // ensure mock app is aware of this change
      // TODO: send the restartProxy params over to adapter
      if (!bridged && typeof browser != 'undefined') {
        return resolve(adapter.sendMessage('enablePopularRule', { name, restartProxy }));
      }
      return resolve();
    })
      .then(() => {
        if (!this.foreground && restartProxy) { return this.restartProxy(); }
        return Promise.resolve();
      })
      .then(() => {
        this.storage.setItem(this.storageKeys.poprk, this.enabledPopularRules().join(','));
        debug(`bypasslist: added ${name}`);
      });
  }

  disablePopularRule(name, bridged, restartProxy = true) {
    if (!this.popularRulesByName().includes(name)) {
      return Promise.reject(new Error(`no such popular rule: ${name}`));
    }
    if (!this.enabledPopularRules().includes(name)) { return Promise.resolve(); }

    const { adapter } = this.app;

    return new Promise((resolve) => {
      // disable rule
      this.enabledRules.delete(name);

      // ensure mock app is aware of this change
      if (!bridged && typeof browser != 'undefined') {
        return resolve(adapter.sendMessage('disablePopularRule', { name, restartProxy }));
      }
      return resolve();
    })
      .then(() => {
        if (!this.foreground && restartProxy) { this.restartProxy(); }
      })
      .then(() => {
        this.storage.setItem(this.storageKeys.poprk, this.enabledPopularRules().join(','));
        debug(`bypasslist: removed ${name}`);
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
    if (this.foreground && typeof browser != 'undefined') {
      const { adapter } = this.app;
      adapter.sendMessage(Type.DOWNLOAD_BYPASS_JSON);
    }
    else {
      const payload = JSON.stringify({
        popularRules: this.enabledPopularRules(),
        userRules: this.getUserRules(),
      });
      const file = new File('application/json', [payload]);
      file.download('bypass-rules.json');
    }
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
