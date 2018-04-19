export default function(app) {
  const storageKeys = {userrk: "bypasslist:customlist", poprk:"bypasslist:popularrules"};
  const {storage, regionlist} = app.util;
  const trimUserRules = (rules) => rules.map(e => e.trim()).filter(e => e.length > 0);
  const enabledRules = new Map([
    ["privatenetworks", ["0.0.0.0/8", "10.0.0.0/8", "127.0.0.0/8", "169.254.0.0/16",
                         "192.168.0.0/16", "172.16.0.0/12", "::1", "localhost", "*.local"]],
    ["pinggateways", () => regionlist.toArray().map((r) => `http://${r.host}:8888`)],
    [storageKeys.userrk, []],
    [storageKeys.poprk, []]
  ]);
  const popularRules = new Map([
    ["netflix", ["https://netflix.com",
                 "https://*.netflix.com",
                 "https://*.nflxvideo.net",
                 "https://*.nflximg.net"]],
    ["hulu", ["https://*.hulu.com", "https://*.hulustream.com"]]
  ]);

  this.isRuleEnabled = (ruleName) => enabledRules.has(ruleName);
  this.popularRulesByName = () => Array.from(popularRules.keys());
  this.getUserRules = () => trimUserRules(Array.from(enabledRules.get(storageKeys.userrk)));
  this.visibleSize = () => this.getUserRules().length + this.enabledPopularRules().length;

  this.setUserRules = (rules) => {
    storage.setItem(storageKeys.userrk, trimUserRules(Array.from(rules)).join(","));
    enabledRules.set(storageKeys.userrk, rules);
    return this.getUserRules();
  }

  this.addUserRule = (string) => {
    if (string.endsWith('/')) { string = string.substring(0, string.length - 1); }
    const userRules = this.getUserRules();
    userRules.push(string);
    this.setUserRules([... new Set(userRules)]);
  }

  this.removeUserRule = (string) => {
    const rules = this.getUserRules();
    this.setUserRules(rules.filter(e => e !== string));
  }

  this.enablePopularRule = (name) => {
    if(!this.popularRulesByName().includes(name)) { return; }

    return new Promise((resolve, reject) => {
      const {proxy} = app;
      const {storage} = app.util;
      const complete = () => {
        storage.setItem(storageKeys.poprk, this.enabledPopularRules().join(","));
        resolve();
        debug(`bypasslist: added ${name}`);
      }
      enabledRules.set(name, popularRules.get(name));
      if(proxy.enabled()) {
        proxy.enable(regionlist.getSelectedRegion()).then(complete);
      }
      else { complete(); }
    });
  }

  this.disablePopularRule = (name) => {
    if(!this.popularRulesByName().includes(name)) { return; }

    return new Promise((resolve, reject) => {
      const {proxy} = app;
      const complete = () => {
        storage.setItem(storageKeys.poprk, this.enabledPopularRules().join(","));
        resolve();
        debug(`bypasslist: removed ${name}`);
      }
      if(enabledRules.has(name)) {
        enabledRules.delete(name);
        if(proxy.enabled()) {
          proxy.enable(regionlist.getSelectedRegion()).then(complete);
        }
        else { complete(); }
      }
      else { reject("rule not found"); }
    });
  }

  this.enabledPopularRules = () => {
    const enabledRulesByName = Array.from(enabledRules.keys());
    const popularRulesByName = this.popularRulesByName();
    return popularRulesByName.filter((name) => enabledRulesByName.includes(name));
  }

  this.toArray = () => {
    const rules = [...Array.from(enabledRules.values())];
    return [].concat(...rules.map((r) => typeof(r) === "function" ? r() : r));
  }

  // init
  const {userrk, poprk} = storageKeys
  if(storage.hasItem(userrk) && storage.getItem(userrk).length > 0) {
    this.setUserRules(storage.getItem(userrk).split(","));
  }

  if(storage.hasItem(poprk) && storage.getItem(poprk).length > 0) {
    storage.getItem(poprk).split(',').forEach((name) => this.enablePopularRule(name));
  }

  return this;
}
