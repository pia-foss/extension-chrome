export default function(app) {
  const isNewVersion = (newVersionStr, oldVersionStr) => {
          const oldVersion = parseInt(oldVersionStr.replace(/\./g, "")),
                newVersion = parseInt(newVersionStr.replace(/\./g, ""))
          return newVersion > oldVersion
        }

  const onUpdate = async (details) => {
    await app.util.i18n.worker()
    const {contentsettings} = app,
          title = t("ExtensionUpdated"),
          body = t("WelcomeToNewVersion", {appVersion: `v${app.buildinfo.version}`})
    if(isNewVersion(app.buildinfo.version, details.previousVersion))
      contentsettings.extensionNotification.create(title, {body})
  }

  return (details) => {
    switch(details.reason) {
    case "update":
      onUpdate(details)
      break
    }
  }
}
