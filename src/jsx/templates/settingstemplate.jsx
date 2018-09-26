import initPageTitle        from 'component/pagetitle';
import initBypassSettingSection       from 'component/bypasslist/settingsection';
import initLanguageDropdown from 'component/languagedropdown';
import SettingSections from 'component/settingsections';

export default function(renderer, app, window, document) {
  const React           = renderer.react,
        PageTitle       = initPageTitle(renderer, app, window, document),
        LanguageDropdown = initLanguageDropdown(renderer, app, window, document),
        BypassSettingSection = initBypassSettingSection(renderer, app, window, document);

  return class SettingsTemplate extends React.Component {

    constructor (props) {
      super(props);

      // Bindings
      this.onDebugClick = this.onDebugClick.bind(this);
      this.languageDropdownBuilder = this.languageDropdownBuilder.bind(this);
    }

    onDebugClick (ev) {
      ev.preventDefault();
      renderer.renderTemplate('debuglog');
    }

    warningDiv ({app}) {
      const regionName = app.util.regionlist.getSelectedRegion().localizedName();
      if (app.proxy.enabled()) {
        return (
          <div className="settingswarning-connected noselect">
            {t("SettingsWarningConnected", {browser: app.buildinfo.browser, region: regionName})}
          </div>
        );
      }
      else {
        return (
          <div className="settingswarning-disconnected noselect">
            {t("SettingsWarning")}
          </div>
        );
      }
    }

    gitRow ({name, message}) {
      return (
        <div className="row">
          <span className="branch col-xs-2">{name}</span>
          <span className="gitbranch">{message}</span>
        </div>
      );
    }

    gitInfo ({row: Row, gitcommit, gitbranch}) {
      const numValidHashes = [gitcommit, gitbranch]
        .filter((e) => e && (/^[a-zA-Z0-9\-.]+$/).test(e))
        .length;

      if (numValidHashes === 2) {
        return (
          <div className="gitinfo">
            <Row name="Branch" message={gitbranch} />
            <Row name="Commit" message={gitcommit} />
          </div>
        );
      }
      else {
        return null;
      }
    }

    languageDropdownBuilder () {
      return (
        <div style={{color: "#333 !important"}} className='field settingitem noselect'>
          <div className='col-xs-6 settingblock'>
            <a className="macetooltip">
              <label htmlFor="languages">
                {t("UILanguage")}
                <div className="popover arrow-bottom">{t("UILanguageTooltip")}</div>
              </label>
            </a>
          </div>
          <div className="col-xs-6 checkbox-container">
            <LanguageDropdown/>
          </div>
        </div>
      );
    }

    render() {
      const GitInfo = this.gitInfo;
      const WarningDiv = this.warningDiv;

      return (
        <div id="settings-template" className="row">
          <div className="top-border" id="settings">
            <PageTitle previousTemplate="authenticated" text={t("ChangeExtensionSettings")}/>
            <WarningDiv app={app} />
            <SettingSections app={app} onDebugClick={this.onDebugClick} languageDropdownBuilder={this.languageDropdownBuilder} />
            <div className="sectionwrapper bypass">
              <BypassSettingSection/>
            </div>
            <div className='field panelfooter'>
              <div className='col-xs-12 settingblock'>
                v{app.buildinfo.version} (<a href="#" onClick={() => renderer.renderTemplate("changelog")}>View Changelog</a>)
                <GitInfo {...app.buildinfo} row={this.gitRow} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
}
