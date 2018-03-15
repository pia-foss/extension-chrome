import ChromeSetting from "chromesettings/chromesetting"
export default function(app) {
  const self = Object.create(ChromeSetting(chrome.privacy.services.safeBrowsingEnabled, (details) => {
    return details.value === false
  }))

  self.settingID = "blocksafebrowsing"
  self.settingDefault = true

  self.applySetting = () => {
    return self._set({value: false}).then(() => {
      debug("safebrowsing.js: block ok")
      return self
    }).catch((error) => {
      debug(`safebrowsing.js: block failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear().then(() => {
      debug(`safebrowsing.js: unblock ok`)
      return self
    }).catch((error) => {
      debug(`safebrowsing.js: unblock failed (${error})`)
      return self
    })
  }

  return self
}
