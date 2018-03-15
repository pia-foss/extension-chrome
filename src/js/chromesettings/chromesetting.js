/*
   This object wraps a ChromeSetting: https://developer.chrome.com/extensions/types#type-ChromeSetting
   Similar to but not the same as a ContentSetting.
*/
export default function(chromeSetting, blockedPredicate) {
  const self = Object.create(null),
        defaultSetOptions   = {scope: "regular"},
        defaultGetOptions   = {},
        defaultClearOptions = {scope: "regular"},
        onChange = (details) => {
          levelOfControl = details.levelOfControl
          controllable = levelOfControl === "controllable_by_this_extension" || levelOfControl === "controlled_by_this_extension"
          blocked = blockedPredicate(details)
        }

  let levelOfControl,
      controllable,
      blocked,
      applied

  self.getLevelOfControl = () => levelOfControl
  self.isControllable = () => levelOfControl === undefined || controllable
  self.isBlocked = () => blocked
  self.isApplied = () => applied

  self._set = (options) => {
    return new Promise((resolve, reject) => {
      if(self.isControllable())
        chromeSetting.set(Object.assign({}, defaultSetOptions, options), () => {
          if(chrome.runtime.lastError === undefined) {
            applied = true
            resolve()
          } else {
            reject(chrome.runtime.lastError)
          }
        })
      else
        reject("extension cannot control this setting")
    })
  }

  self._get = () => {
    return new Promise((resolve, reject) => {
      chromeSetting.get(defaultGetOptions, (details) => {
        onChange(details)
        chrome.runtime.lastError === undefined ? resolve(details) : reject(chrome.runtime.lastError)
      })
    })
  }

  self._clear = (options) => {
    return new Promise((resolve, reject) => {
      if(self.isControllable())
        chromeSetting.clear(Object.assign({}, defaultClearOptions, options || {}), () => {
          if(chrome.runtime.lastError === undefined) {
            applied = false
            resolve()
          } else {
            reject(chrome.runtime.lastError)
          }
        })
      else
        reject("extension cannot control this setting")
    })
  }

  chromeSetting.get({}, onChange)
  chromeSetting.onChange.addListener(onChange)

  return self
}
