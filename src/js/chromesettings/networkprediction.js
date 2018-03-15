import ChromeSetting from "chromesettings/chromesetting"
export default function(app) {
  const self = Object.create(ChromeSetting(chrome.privacy.network.networkPredictionEnabled, (details) => {
    return details.value === false
  }))

  self.settingID = "blocknetworkprediction"
  self.settingDefault = true

  self.applySetting = () => {
    return self._set({value: false}).then(() => {
      debug("networkprediction.js: block ok")
      return self
    }).catch((error) => {
      debug(`networkprediction.js: block failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear().then(() => {
      debug(`networkprediction.js: unblock ok`)
      return self
    }).catch((error) => {
      debug(`networkprediction.js: unblock failed (${error})`)
      return self
    })
  }

  return self
}
