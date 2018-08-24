import React                  from "react";
import ReactDOM               from "react-dom";
import LoginTemplate          from 'templates/logintemplate';
import AuthenticatedTemplate  from 'templates/authenticatedtemplate';
import ChangeRegionTemplate   from 'templates/changeregiontemplate';
import SettingsTemplate       from 'templates/settingstemplate';
import ChromeUpgradeTemplate  from 'templates/chromeupgradetemplate';
import PleaseWaitTemplate     from 'templates/pleasewaittemplate';
import UncontrollableTemplate from 'templates/uncontrollabletemplate';
import ChangelogTemplate      from 'templates/changelogtemplate';
import DebugLogTemplate       from 'templates/debuglogtemplate';
import BypassListTemplate     from 'templates/bypasslisttemplate';

export default class Renderer {
  constructor(app, window, document) {
    // TODO: remove ref to React when components are more stable
    this.react = React;
    this.currentTemplate  = undefined;
    this.previousTemplate = undefined;
    this.templates = {
      "login":           () => LoginTemplate(this, app, window, document),
      "authenticated":   () => AuthenticatedTemplate(this, app, window, document),
      "change_region":   () => ChangeRegionTemplate(this, app, window, document),
      "settings":        () => SettingsTemplate(this, app, window, document),
      "upgrade_chrome":  () => ChromeUpgradeTemplate(this, app, window, document),
      "please_wait":     () => PleaseWaitTemplate(this, app, window, document),
      "uncontrollable":  () => UncontrollableTemplate(this, app, window, document),
      "changelog":       () => ChangelogTemplate(this, app, window, document),
      "debuglog":        () => DebugLogTemplate(this, app, window, document),
      "bypasslist":      () => BypassListTemplate(this, app, window, document)
    };

    // bindings
    this.renderTemplate = this.renderTemplate.bind(this);
  }

  renderTemplate (templateName, customNode) {
    try {
      const template = this.templates[templateName];

      if(template) {
        this.previousTemplate = this.currentTemplate;
        this.currentTemplate  = templateName;
        customNode = customNode || document.getElementById("template-content");
        ReactDOM.render(React.createElement(template()), customNode);
      }
    }
    /**
     * NOTE: This will catch any initial rendering bugs that might come about from the
     * background process dying and leaving the foreground unusable. Closing the window
     * and bringing it back up should retrieve the new background process. This originated
     * in Firefox but has been ported over to chrome. This should be replaced with an
     ErrorBoundary at some point in the future.
     */
    catch (err) { window.close(); }
  }
}
