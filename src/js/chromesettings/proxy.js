import ChromeSetting from 'chromesettings/chromesetting';

const createProxyRule = (region, port) => {
  return {
    scheme: region.scheme,
    host: region.host,
    port,
  };
};

let settingsInMemory = false;

export default function (app) {
  const self = Object.create(ChromeSetting(chrome.proxy.settings, () => {
    const { storage, icon, settingsmanager } = app.util;
    switch (self.enabled()) {
      case true:
        settingsmanager.handleConnect();
        icon.online();
        storage.setItem('online', 'true');
        break;
      case false:
        settingsmanager.handleDisconnect();
        icon.offline();
        storage.setItem('online', 'false');
        break;
      default:
        break;
    }
    settingsInMemory = true;
  }));

  self.settingsInMemory = () => { return settingsInMemory; };
  self.enabled = () => { return self.getLevelOfControl() === 'controlled_by_this_extension'; };

  self.readSettings = () => {
    return self._get()
      .then(() => {
        debug('proxy.js: read settings');
        return self;
      });
  };

  self.enable = (region) => {
    const { bypasslist, settings } = app.util;
    const port = settings.getItem('maceprotection') ? region.macePort : region.port;
    const proxyRule = createProxyRule(region, port);
    const value = { mode: 'fixed_servers', rules: { singleProxy: proxyRule, bypassList: bypasslist.toArray() } };
    return self._set({ value })
      .then(() => {
        debug('proxy.js: enabled');
        return self;
      });
  };

  self.disable = () => {
    return self._clear()
      .then(() => {
        debug('proxy.js: disabled');
        return self;
      });
  };

  return self;
}
