import ChromeSetting from "chromesettings/chromesetting"

export default function(app) {
  const self = Object.create(ChromeSetting(chrome.privacy.websites.thirdPartyCookiesAllowed, (details) => {
    return details.value === false
  }))

  self.settingID = "blockthirdpartycookies"
  self.settingDefault = true

  self.applySetting = () => {
    return self._set({value: false}).then(() => {
      debug("thirdpartycookies.js: block ok")
      return self
    }).catch((error) => {
      debug(`thirdpartycookies.js: block failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug("thirdpartycookies.js: unblock ok")
      return self
    }).catch((error) => {
      debug(`thirdpartycookies.js: unblock failed (${error})`)
      return self
    })
  }

  return self
}
