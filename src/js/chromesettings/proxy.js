import ChromeSetting from 'chromesettings/chromesetting';

const ONLINE_KEY = 'online';

class BrowserProxy extends ChromeSetting {
  constructor(app) {
    super(chrome.proxy.settings);

    // bindings
    this.onChange = this.onChange.bind(this);
    this.settingsInMemory = this.settingsInMemory.bind(this);
    this.enabled = this.enabled.bind(this);
    this.readSettings = this.readSettings.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.getEnabled = this.getEnabled.bind(this);

    // init
    this.app = app;
    this.settingID = 'proxy';
    this.areSettingsInMemory = false;
  }

  settingsInMemory() {
    return this.areSettingsInMemory;
  }

  getEnabled() {
    return this.getLevelOfControl() === ChromeSetting.controlled;
  }

  enabled() {
    return this.getEnabled();
  }

  async readSettings() {
    await this.get();
    BrowserProxy.debug('read settings');

    return this;
  }

  async enable() {
    const { bypasslist, settings, regionlist } = this.app.util;
    const region = regionlist.getSelectedRegion();
    const port = settings.getItem('maceprotection') ? region.macePort : region.port;
    const proxyRule = BrowserProxy.createProxyRule(region, port);
    const value = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: proxyRule,
        bypassList: bypasslist.toArray(),
      },
    };
    await this.set({ value });
    BrowserProxy.debug('enabled');

    return this;
  }

  async disable() {
    await this.clear();
    BrowserProxy.debug('disabled');

    return this;
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
    this.setBlocked(false);

    if (this.getEnabled()) {
      settingsmanager.handleConnect();
      icon.online();
      storage.setItem(ONLINE_KEY, String(true));
    }
    else {
      settingsmanager.handleDisconnect();
      icon.offline();
      storage.setItem(ONLINE_KEY, String(false));
    }
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
