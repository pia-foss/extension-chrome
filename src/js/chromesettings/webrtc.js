import ChromeSetting from "chromesettings/chromesetting"
export default function(app) {
  const self = Object.create(ChromeSetting(chrome.privacy.network.webRTCIPHandlingPolicy, (details) => {
    return details.value === "disable_non_proxied_udp"
  }))

  self.settingID = "preventwebrtcleak"
  self.settingDefault = true

  self.applySetting = () => {
    return self._set({value: "disable_non_proxied_udp"}).then(() => {
      debug("webrtc.js: block ok")
      return self
    }).catch((error) => {
      debug(`webrtc.js: block failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear().then(() => {
      debug(`webrtc.js: unblock ok`)
      return self
    }).catch((error) => {
      debug(`webrtc.js: unblock failed (${error})`)
      return self
    })
  }

  self.blockable = chrome.privacy.network.webRTCIPHandlingPolicy !== undefined

  return self
}
