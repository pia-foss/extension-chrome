import ChromeSetting from "chromesettings/chromesetting"

const createProxyRule = (region, port) => {
  return {
    scheme: region.scheme,
    host: region.host,
    port: port
  }
}

let settingsInMemory = false

export default function(app) {
  const self = Object.create(ChromeSetting(chrome.proxy.settings, (details) => {
    const {icon,settingsmanager} = app.util
    switch(self.enabled()) {
    case true:
      settingsmanager.handleConnect()
      icon.online()
      break
    case false:
      settingsmanager.handleDisconnect()
      icon.offline()
      break
    }
    settingsInMemory = true
  }))

  self.settingsInMemory = () => settingsInMemory
  self.enabled = () => self.getLevelOfControl() === "controlled_by_this_extension"

  self.readSettings = () => {
    return self._get().then(() => {
      debug("proxy.js: read settings")
      return self
    })
  }

  self.enable = (region) => {
    const {bypasslist,settings} = app.util,
          port = settings.getItem("maceprotection") ? region.macePort : region.port,
          proxyRule = createProxyRule(region, port),
          value = {mode: 'fixed_servers', rules: {singleProxy: proxyRule, bypassList: bypasslist.toArray()}}
    return self._set({value}).then(() => {
      debug("proxy.js: enabled")
      return self
    })
  }

  self.disable = () => {
    return self._clear().then(() => {
      debug("proxy.js: disabled")
      return self
    })
  }

  return self
}
