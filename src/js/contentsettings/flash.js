import ContentSetting from '@contentsettings/contentsetting';

export default function (app) {
  const self = Object.create(ContentSetting(app, chrome.contentSettings.plugins));

  // self.settingID = 'blockadobeflash';
  // self.settingDefault = false;

  self.applySetting = () => {
    return self._set({
      setting: 'block'
    }).then(() => {
      debug(`flash.js: block ok`);
      return self;
    }).catch((error) => {
      debug(`flash.js: block failed (${error})`);
      return self;
    });
  };

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug('flash.js: unblock ok');
      return self;
    }).catch((error) => {
      debug(`flash.js: unblock failed (${error})`);
      return self;
    });
  };

  return self;
}
