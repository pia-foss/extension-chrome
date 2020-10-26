import ContentSetting from '@contentsettings/contentsetting';

export default function (app) {
  const self = Object.create(ContentSetting(app, chrome.contentSettings.plugins));

  self.settingID = 'blockadobeflash';
  self.settingDefault = true;

  self.applySetting = () => {
    return self._set({
      setting: 'block',
      resourceIdentifier: { id: 'adobe-flash-player' },
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
