import ChromeSetting from "chromesettings/chromesetting"

export default function(app) {
  const self = Object.create(ChromeSetting(chrome.privacy.websites.hyperlinkAuditingEnabled, (details) => {
    return details.value === false
  }))

  self.settingID = "blockhyperlinkaudit"
  self.settingDefault = true

  self.applySetting = () => {
    return self._set({value: false}).then(() => {
      debug("hyperlinkaudit.js: block ok")
      return self
    }).catch((error) => {
      debug(`hyperlinkaudit.js: block failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug("hyperlinkaudit.js: unblock ok")
      return self
    }).catch((error) => {
      debug(`hyperlinkaudit.js: unblock failed (${error})`)
      return self
    })
  }

  return self
}
