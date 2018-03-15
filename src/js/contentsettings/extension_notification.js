import ContentSetting from "contentsettings/contentsetting"

export default function(app) {
  const defaultOptions = {icon: "/images/icons/icon64.png"},
        self = Object.create(ContentSetting(app, chrome.contentSettings.notifications)),
        {settings} = app.util

  self.settingID = "allowExtensionNotifications"
  self.settingDefault = true
  self.alwaysActive = true

  self.applySetting = () => {
    return self._set({
      setting: "allow",
      primaryPattern: `*://${chrome.runtime.id}/*`
    }).then(() => {
      debug(`extensionNotification.js: allow ok`)
      return self
    }).catch((error) => {
      debug(`extensionNotification.js: allow failed (${error})`)
      return self
    })
  }

  self.clearSetting = () => {
    return self._clear({}).then(() => {
      debug("extensionNotification.js: clear ok")
      return self
    }).catch((error) => {
      debug(`extensionNotification.js: clear failed (${error})`)
      return self
    })
  }

  self.create = (title, options) => {
    const {settings} = app.util
    if(!self.isAllowed())
      return debug("extensionNotification.js: create failed (disabled).")
    debug("extensionNotification.js: create notification")
    new Notification(title, Object.assign({}, defaultOptions, options))
  }

  if(!settings.hasItem(self.settingID) || settings.getItem(self.settingID))
    self.applySetting()

  return self
}
