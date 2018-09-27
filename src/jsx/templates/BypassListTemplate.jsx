import React, { Component } from 'react';
import PageTitle from '../component/PageTitle';
import OfflineWarning from '../component/OfflineWarning';
import UserRules from '../component/bypasslist/UserRules';
import PopularRules from '../component/bypasslist/PopularRules';
import ImportExportRules from '../component/bypasslist/ImportExportRules';

export default function () {
  return class BypassListTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.app = background.app;

      // properties
      this.buildinfo = this.app.buildinfo;
      this.regionlist = this.app.util.regionlist;
      this.popularRules = this.app.util.bypasslist.popularRulesByName();

      // bindings
      this.warning = this.warning.bind(this);
    }

    warning() {
      const region = this.regionlist.getSelectedRegion();
      if (region && this.app.proxy.enabled()) {
        return (
          <div className="settingswarning-connected noselect">
            { t('SettingsWarningConnected', { region: region.localizedName(), browser: this.buildinfo.browser }) }
          </div>
        );
      }

      return (
        <div className="settingswarning-disconnected noselect">
          { t('SettingsWarning') }
        </div>
      );
    }

    render() {
      return (
        <div id="bypasslist-template" className="row">
          <OfflineWarning />

          <div className="top-border">
            <PageTitle previousTemplate="settings" text={t('ProxyBypassList')} />
            { this.warning() }
          </div>

          <div className="bypass-wrap">
            <p className="introtext" dangerouslySetInnerHTML={{ __html: t('BypassWarning') }} />
            <ImportExportRules />
            <PopularRules popularRules={this.popularRules} />
            <UserRules />
          </div>
        </div>
      );
    }
  };
}
