import React, { Component } from 'react';
import initPageTitle      from 'component/pagetitle';
import PopularRules       from 'component/bypasslist/popularrules';
import UserRules          from 'component/bypasslist/userrules';
import ImportExportRules  from 'component/bypasslist/importexportrules';

export default function(renderer, app, window, document) {
  const PageTitle = initPageTitle(renderer, app, window, document);

  return class BypassList extends Component {
    render() {
      return (
        <div id="bypasslist-template" className="row">
          <div className="top-border">
            <PageTitle previousTemplate="settings" text={ t("ProxyBypassList") } />
            {this.warning()}
          </div>
          <div className="bypass-wrap">
            <p className="introtext" dangerouslySetInnerHTML={{__html: t("BypassWarning")}} />
            <ImportExportRules app={app} />
            <PopularRules app={app} />
            <UserRules app={app} />
          </div>
        </div>
      );
    }

    warning() {
      const { proxy } = app;
      const { regionlist } = app.util;
      const regionName = regionlist.getSelectedRegion().localizedName();
      if(proxy.enabled()) {
        return (
          <div className="settingswarning-connected noselect">
            { t("SettingsWarningConnected", { region: regionName, browser: app.buildinfo.browser }) }
          </div>
        );
      }
      else {
        return (
          <div className="settingswarning-disconnected noselect">
            { t("SettingsWarning") }
          </div>
        );
      }
    }
  };
}
