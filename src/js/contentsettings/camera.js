import ContentSetting from '@contentsettings/contentsetting';

export default function (app) {
  const self = Object.create(ContentSetting(app, chrome.contentSettings.camera));

  self.settingID = 'blockcamera';
  self.settingDefault = false;

  self.applySetting = () => {
    return self._set({ setting: 'block' }).then(() => {
      debug(`camera.js: block ok`);
      return self;
    }).catch((error) => {
      debug(`camera.js: block failed (${error})`);
      return self;
    });
  };

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug('camera.js: unblock ok');
      return self;
    }).catch((error) => {
      debug(`camera.js: unblock failed(${error})`);
      return self;
    });
  };

  return self;
}
