import ContentSetting from '@contentsettings/contentsetting';

export default function (app) {
  const defaultOptions = { icon: '/images/icons/icon64.png' };
  const self = Object.create(ContentSetting(app, chrome.contentSettings.notifications));
  const { settings } = app.util;

  self.settingID = 'allowExtensionNotifications';
  self.settingDefault = true;
  self.alwaysActive = true;

  self.applySetting = () => {
    return self._set({
      setting: 'allow',
      primaryPattern: `*://${chrome.runtime.id}/*`,
    }).then(() => {
      debug(`extensionNotification.js: allow ok`);
      return self;
    }).catch((error) => {
      debug(`extensionNotification.js: allow failed (${error})`);
      return self;
    });
  };

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug('extensionNotification.js: clear ok');
      return self;
    }).catch((error) => {
      debug(`extensionNotification.js: clear failed (${error})`);
      return self;
    });
  };

  self.create = (title, options) => {
    if (!self.isAllowed()) {
      debug('extensionNotification.js: create failed (disabled).');
    }
    else {
      debug('extensionNotification.js: create notification');
      new Notification(title, Object.assign({}, defaultOptions, options));
    }
  };

  self.init = () => {
    if (!settings.hasItem(self.settingID) || settings.getItem(self.settingID)) {
      self.applySetting();
    }
  };

  return self;
}
