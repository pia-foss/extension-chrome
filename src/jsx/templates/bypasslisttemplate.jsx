import initPageTitle          from 'component/pagetitle';
import initPopularRules       from 'component/bypasslist/popularrules';
import initUserRules          from 'component/bypasslist/userrules';
import ImportExportRules  from 'component/bypasslist/importexportrules';

export default function(renderer, app, window, document) {
  const React             = renderer.react,
        PageTitle         = initPageTitle(renderer, app, window, document),
        PopularRules      = initPopularRules(renderer, app, window, document),
        UserRules         = initUserRules(renderer, app, window, document);

  return class BypassList extends React.Component {
    render() {
      return (
        <div id="bypasslist-template" className="row">
          <div className="top-border">
            <PageTitle previousTemplate="settings" text={t("ProxyBypassList")}/>
            {this.warning()}
          </div>
          <div className="bypass-wrap">
            <p className="introtext" dangerouslySetInnerHTML={{__html: t("BypassWarning")}} />
            <ImportExportRules app={app} />
            <PopularRules/>
            <UserRules/>
          </div>
        </div>
      );
    }

    warning() {
      const {proxy} = app,
            {regionlist} = app.util,
            regionName = regionlist.getSelectedRegion().localizedName();
      if(proxy.enabled())
        return (
          <div className="settingswarning-connected noselect">
            {t("SettingsWarningConnected", {region: regionName, browser: app.buildinfo.browser})}
          </div>
        );
      else
        return (
          <div className="settingswarning-disconnected noselect">
            {t("SettingsWarning")}
          </div>
        );
    }
  };
}
