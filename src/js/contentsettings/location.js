import ContentSetting from '@contentsettings/contentsetting';

export default function (app) {
  const self = Object.create(ContentSetting(app, chrome.contentSettings.location));

  self.settingID = 'blocklocation';
  self.settingDefault = false;

  self.applySetting = () => {
    return self._set({setting: 'block'})
      .then(() => {
        debug(`location.js: block ok`);
        return self;
      }).catch((error) => {
        debug(`location.js: block failed (${error})`);
        return self;
      });
  };

  self.clearSetting = () => {
    return self._clear({})
      .then(() => {
        debug('location.js: unblock ok');
        return self;
      }).catch((error) => {
        debug(`location.js: unblock failed (${error})`);
        return self;
      });
  };

  return self;
}
