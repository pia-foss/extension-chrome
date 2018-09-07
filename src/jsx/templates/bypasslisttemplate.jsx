import React, { Component } from 'react';
import initPageTitle from '../component/pagetitle';
import OfflineWarning from '../component/OfflineWarning';
import UserRules from '../component/bypasslist/userrules';
import PopularRules from '../component/bypasslist/popularrules';
import ImportExportRules from '../component/bypasslist/importexportrules';

export default function (renderer, app, window, document) {
  const PageTitle = initPageTitle(renderer, app, window, document);

  return class BypassList extends Component {
    constructor(props) {
      super(props);

      // properties
      this.app = app;

      // bindings
      this.warning = this.warning.bind(this);
    }

    warning() {
      const { proxy } = this.app;
      const { regionlist } = this.app.util;
      const regionName = regionlist.getSelectedRegion().localizedName();
      if (proxy.enabled()) {
        return (
          <div className="settingswarning-connected noselect">
            { t('SettingsWarningConnected', { region: regionName, browser: app.buildinfo.browser }) }
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
            <ImportExportRules app={app} />
            <PopularRules app={app} />
            <UserRules app={app} />
          </div>
        </div>
      );
    }
  };
}
