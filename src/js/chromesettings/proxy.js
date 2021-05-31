import ChromeSetting from '@chromesettings/chromesetting';
import http from '@helpers/http';

const ONLINE_KEY = 'online';
const pacengine = require('../pacengine');

class BrowserProxy extends ChromeSetting {
  constructor(app) {
    super(chrome.proxy.settings);
    // bindings
    this.onChange = this.onChange.bind(this);
    this.settingsInMemory = this.settingsInMemory.bind(this);
    this.enabled = this.enabled.bind(this);
    this.readSettings = this.readSettings.bind(this);
    this.enable = this.enable.bind(this);
    this.filterByRemovedLocation = this.filterByRemovedLocation.bind(this);
    this.disable = this.disable.bind(this);
    this.getEnabled = this.getEnabled.bind(this);
    this.getProxyType = this.getProxyType.bind(this);
    this.setProxyType = this.setProxyType.bind(this);  
    // init
    this.app = app;
    this.settingID = 'proxy';
    this.areSettingsInMemory = false;
    this.rules = []
    // test data
    this.changing = false;
  }

  setProxyType(mode) {
    this.proxyType = mode;
  }

  getProxyType() {
    return this.proxyType;
  }

  settingsInMemory() {
    return this.areSettingsInMemory;
  }

  getEnabled() {
    if(this.getProxyType() === 'fixed_servers' || this.getProxyType() === 'pac_script'){
      return this.getProxyType()
    }
  }

  enabled() {
    return this.getEnabled();
  }

  async readSettings() {
    await this.get();
    BrowserProxy.debug('read settings');
    return this;
  }

  filterByRemovedLocation(location){
    // filter rules by location
    if(location){
      this.rules = this.rules.filter( (rule) => {
        return rule.cc != location.userSelect
      } )
     }
  }

  async enable() {
    const didChange = !this.getEnabled();
    this.changing = true;
    const key = app.util.regionlist.getPort();
    try {
      const {
        bypasslist,
        settings,
        regionlist,
        ipManager,
        smartlocation
      } = this.app.util;
      const locations =  Object.values(regionlist.getRegions());
      //get dictionary
      const nodeDict = pacengine.getNodeDictFromLocations(
        locations,
        key
      );
      let userRulesSmartLoc;
      if( smartlocation.getSmartLocationRules('smartLocationRules')){
        userRulesSmartLoc = smartlocation.getSmartLocationRules('smartLocationRules').map(loc =>{
          return {cc:loc.proxy.id,domain:loc.userRules,country:loc}
        });
      }
      const region = regionlist.getSelectedRegion();

      if (didChange) {
        try {
          await ipManager.update({ retry: false });
        }
        catch (_) {
          debug('proxy: failed to update ip before enabling');
        }
      }
      let value = {};
      if(smartlocation.getSmartLocationRules('smartLocationRules').length > 0 && smartlocation.getSmartLocationRules('checkSmartLocation')){
        this.rules = userRulesSmartLoc;
        const pacScript = pacengine.exportPAC(
          region.id,
          nodeDict,
          userRulesSmartLoc,
          bypasslist.getRulesSmartLoc()
        );
        //get the pac script
        value= {
            mode: 'pac_script',
            pacScript: {
              data: pacScript
            }
          }
      } else {
        
        const port = region[key];
        const proxyRule = BrowserProxy.createProxyRule(region, port);
        value = {
              mode: 'fixed_servers',
              rules: { 
                singleProxy: proxyRule,
                bypassList: bypasslist.toArray(),
              },
            };
      }

      await this.set({ value });
      // Make request immediately to force handshake to proxy server
      // Necessary because we cannot perform our side of handshake on
      // Chrome pages for security reasons
      http.head('https://privateinternetaccess.com');
      // trigger ip update
      ipManager.update({ retry: true });
      BrowserProxy.debug('enabled');
      this.changing = false;
      return this;
    }
    catch (err) {
      this.changing = false;
      throw err;
    }
  }

  async disable() {
    const didChange = this.getEnabled();
    this.changing = true;
    const { ipManager } = this.app.util;
    try {
      await this.clear();
      if (didChange) {  ipManager.update({ retry: true }); }
      BrowserProxy.debug('disabled');
   
      this.changing = false;
      return this;
    }
    catch (err) {
      this.changing = false;
      throw err;
    }
  }

  onChange(details) {
    const {
      util: {
        storage,
        icon,
        settingsmanager,
      },
    } = this.app;

    this.setLevelOfControl(details.levelOfControl);
    this.setProxyType(details.value.mode);
    this.setBlocked(false);
    if (this.getEnabled()) {
      settingsmanager.enable();
      icon.online();
      storage.setItem(ONLINE_KEY, true);
    }
    else {
      settingsmanager.disable();
      icon.offline();
      storage.setItem(ONLINE_KEY, false);
    }
    settingsmanager.clearAndReapplySettings();
    // eslint-disable-next-line no-param-reassign
    this.areSettingsInMemory = true;
  }

  static createProxyRule(region, port) {
    return {
      scheme: region.scheme,
      host: region.host,
      port,
    };
  }

  static debug(msg, err) {
    return ChromeSetting.debug('proxy', msg, err);
  }
}

export default BrowserProxy;
