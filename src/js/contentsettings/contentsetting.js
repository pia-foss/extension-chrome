/*
   This object wraps a ContentSetting: https://developer.chrome.com/extensions/contentSettings#type-ContentSetting.
   Similar to but not the same as a ChromeSetting.
*/
export default function (app, contentSetting) {
  const self = Object.create(null);
  const defaultSetRules = { primaryPattern: '<all_urls>', scope: 'regular' };
  const defaultClearRules = { scope: 'regular' };

  let applied;
  let ask;
  let blocked;
  let allowed;

  self.isApplied = () => { return applied; };
  self.isAsk = () => { return ask; };
  self.isBlocked = () => { return blocked; };
  self.isAllowed = () => { return allowed; };

  self._set = (rules) => {
    return new Promise((resolve, reject) => {
      contentSetting.set(Object.assign({}, defaultSetRules, rules), () => {
        if (chrome.runtime.lastError === undefined) {
          applied = true;
          ask = rules.setting === 'ask';
          blocked = rules.setting === 'block';
          allowed = rules.setting === 'allow';
          resolve();
        }
        else {
          reject(chrome.runtime.lastError);
        }
      });
    });
  };

  self._clear = (rules = {}) => {
    const { settingsmanager } = app.util;
    return new Promise((resolve, reject) => {
      contentSetting.clear(Object.assign({}, defaultClearRules, rules), () => {
        if (chrome.runtime.lastError === undefined) {
          blocked = false;
          allowed = false;
          ask = false;
          applied = false;
          settingsmanager.reapply(app.contentsettings);
          resolve();
        }
        else {
          reject(chrome.runtime.lastError);
        }
      });
    });
  };

  return self;
}
