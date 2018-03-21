import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  const setting = chrome.privacy.services.autofillEnabled;
  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingID = "blockautofill";
  self.settingDefault = true;

  self.applySetting = () => {
    return self._set({value: false})
    .then(() => {
      debug(`autofill.js: block ok`);
      return self;
    })
    .catch((error) => {
      debug(`autofill.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear()
    .then(() => {
      debug(`autofill.js: unblock ok`);
      return self;
    })
    .catch((error) => {
      debug(`autofill.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
