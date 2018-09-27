import React from 'react';
import ReactDOM from 'react-dom';
import LoginTemplate from 'templates/LoginTemplate';
import AuthenticatedTemplate from 'templates/AuthenticatedTemplate';
import ChangeRegionTemplate from 'templates/ChangeRegionTemplate';
import SettingsTemplate from 'templates/SettingsTemplate';
import ChromeUpgradeTemplate from 'templates/ChromeUpgradeTemplate';
import PleaseWaitTemplate from 'templates/PleaseWaitTemplate';
import UncontrollableTemplate from 'templates/UncontrollableTemplate';
import ChangelogTemplate from 'templates/ChangeLogTemplate';
import DebugLogTemplate from 'templates/DebugLogTemplate';
import BypassListTemplate from 'templates/BypassListTemplate';

export default class Renderer {
  constructor() {
    this.currentTemplate = undefined;
    this.previousTemplate = undefined;
    this.templates = {
      login: () => { return LoginTemplate(); },
      authenticated: () => { return AuthenticatedTemplate(); },
      change_region: () => { return ChangeRegionTemplate(); },
      settings: () => { return SettingsTemplate(); },
      upgrade_chrome: () => { return ChromeUpgradeTemplate(); },
      please_wait: () => { return PleaseWaitTemplate(); },
      uncontrollable: () => { return UncontrollableTemplate(); },
      changelog: () => { return ChangelogTemplate(); },
      debuglog: () => { return DebugLogTemplate(); },
      bypasslist: () => { return BypassListTemplate(); },
    };

    // bindings
    this.renderTemplate = this.renderTemplate.bind(this);
  }

  renderTemplate(templateName, customNode) {
    try {
      const template = this.templates[templateName];

      if (template) {
        this.previousTemplate = this.currentTemplate;
        this.currentTemplate = templateName;
        const newNode = customNode || document.getElementById('template-content');
        ReactDOM.render(React.createElement(template()), newNode);
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
