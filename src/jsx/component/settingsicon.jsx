export default function(renderer, app) {
  const React = renderer.react,
        excludedTemplates = ["login", "upgrade_chrome", "remember_me"];

  class SettingsIcon extends React.Component {
    openSettings() {
      return renderer.renderTemplate("settings")
    }

    render() {
      const classes = (renderer.currentTemplate === "settings") ? "settings-icon settings-icon-active" : "settings-icon"
      if(excludedTemplates.indexOf(renderer.currentTemplate) === -1)
        return (
          <div title={t("ChangeExtensionSettings")} className={classes} onClick={this.openSettings.bind(this)}><div className="popover darkpopover arrow-bottom">{t("ChangeExtensionSettings")}</div></div>
        )
      else
        return false
    }
  }

  return SettingsIcon
}
