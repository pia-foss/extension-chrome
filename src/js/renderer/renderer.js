import LoginTemplate          from 'templates/logintemplate'
import AuthenticatedTemplate  from 'templates/authenticatedtemplate'
import ChangeRegionTemplate   from 'templates/changeregiontemplate'
import SettingsTemplate       from 'templates/settingstemplate'
import ChromeUpgradeTemplate  from 'templates/chromeupgradetemplate'
import PleaseWaitTemplate     from 'templates/pleasewaittemplate'
import UncontrollableTemplate from 'templates/uncontrollabletemplate'
import ChangelogTemplate      from 'templates/changelogtemplate'
import DebugLogTemplate       from 'templates/debuglogtemplate'
import BypassListTemplate     from 'templates/bypasslisttemplate'
import reactDOM               from "react-dom"
import react                  from "react"

export default function(app, window, document) {
  const self      = this,
        templates = {
          "login":           () => LoginTemplate(self, app, window, document),
          "authenticated":   () => AuthenticatedTemplate(self, app, window, document),
          "change_region":   () => ChangeRegionTemplate(self, app, window, document),
          "settings":        () => SettingsTemplate(self, app, window, document),
          "upgrade_chrome":  () => ChromeUpgradeTemplate(self, app, window, document),
          "please_wait":     () => PleaseWaitTemplate(self, app, window, document),
          "uncontrollable":  () => UncontrollableTemplate(self, app, window, document),
          "changelog":       () => ChangelogTemplate(self, app, window, document),
          "debuglog":        () => DebugLogTemplate(self, app, window, document),
          "bypasslist":      () => BypassListTemplate(self, app, window, document)
        }

  self.currentTemplate  = undefined
  self.previousTemplate = undefined
  self.react = react

  self.renderTemplate = (templateName, customNode) => {
    const template = templates[templateName],
          React    = self.react
    if(template) {
      self.previousTemplate = self.currentTemplate
      self.currentTemplate  = templateName
      return reactDOM.render(React.createElement(template()), customNode || document.getElementById("template-content"))
    }
  }
}
