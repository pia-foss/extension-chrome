/*
   This object wraps a ContentSetting: https://developer.chrome.com/extensions/contentSettings#type-ContentSetting.
   Similar to but not the same as a ChromeSetting.
*/
export default function(app, contentSetting) {
  const self = Object.create(null),
        defaultSetRules   = {primaryPattern: "<all_urls>", scope: "regular"},
        defaultClearRules = {scope: "regular"}

  let applied,
      ask,
      blocked,
      allowed

  self.isApplied = () => applied
  self.isAsk = () => ask
  self.isBlocked = () => blocked
  self.isAllowed = () => allowed

  self._set = (rules) => {
    return new Promise((resolve, reject) => {
      contentSetting.set(Object.assign({}, defaultSetRules, rules), () => {
        if(chrome.runtime.lastError === undefined) {
          applied = true
          ask     = rules.setting === "ask"
          blocked = rules.setting === "block"
          allowed = rules.setting === "allow"
          resolve()
        }
        else {
          reject(chrome.runtime.lastError)
        }
      })
    })
  }

  self._clear = (rules={}) => {
    const {settingsmanager} = app.util
    return new Promise((resolve, reject) => {
      contentSetting.clear(Object.assign({}, defaultClearRules, rules), () => {
        if(chrome.runtime.lastError === undefined) {
          blocked = allowed = ask = applied = false
          settingsmanager.reapply(app.contentsettings)
          resolve()
        }
        else {
          reject(chrome.runtime.lastError)
        }
      })
    })
  }

  return self
}
