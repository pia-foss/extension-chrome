import ContentSetting from '@contentsettings/contentsetting';

export default function (app) {
  const self = Object.create(ContentSetting(app, chrome.contentSettings.microphone));

  self.settingID = 'blockmicrophone';
  self.settingDefault = false;

  self.applySetting = () => {
    return self._set({ setting: 'block' })
      .then(() => {
        debug(`microphone.js: block ok`);
        return self;
      }).catch((error) => {
        debug(`microphone.js: block failed (${error})`);
        return self;
      });
  };

  self.clearSetting = () => {
    return self._clear({})
      .then(() => {
        debug('microphone.js: unblock ok');
        return self;
      }).catch((error) => {
        debug(`microphone.js: unblock failed (${error})`);
        return self;
      });
  };

  return self;
}
