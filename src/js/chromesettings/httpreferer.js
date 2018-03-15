import ChromeSetting from "chromesettings/chromesetting"

export default function(app) {
  const self = Object.create(ChromeSetting(chrome.privacy.websites.referrersEnabled, (details) => {
    return details.value === false
  }))

  self.settingID = "blockreferer"
  self.settingDefault = true

  self.applySetting = () => {
    return self._set({value: false}).then(() => {
      debug("httpreferer.js: block ok")
      return self
    }).catch((error) => {
      debug(`httpreferer.js: block failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug("httpreferer.js: unblock ok")
      return self
    }).catch((error) => {
      debug(`httpreferer.js: unblock failed (${error})`)
      return self
    })
  }

  return self
}
