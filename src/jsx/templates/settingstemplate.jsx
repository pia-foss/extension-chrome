import React, { Component } from 'react';
import initPageTitle from '../component/pagetitle';
import OfflineWarning from '../component/OfflineWarning';
import SettingSections from '../component/settingsections';
import initLanguageDropdown from '../component/languagedropdown';
import initBypassSettingSection from '../component/bypasslist/settingsection';

export default function (renderer, app, window, document) {
  const PageTitle = initPageTitle(renderer, app, window, document);
  const LanguageDropdown = initLanguageDropdown(renderer, app, window, document);
  const BypassSettingSection = initBypassSettingSection(renderer, app, window, document);

  return class SettingsTemplate extends Component {
    constructor(props) {
      super(props);

      // properties
      this.app = app;
      this.renderer = renderer;
      this.languageDropdown = LanguageDropdown;

      // bindings
      this.gitInfo = this.gitInfo.bind(this);
      this.warningDiv = this.warningDiv.bind(this);
      this.onDebugClick = this.onDebugClick.bind(this);
      this.viewChangeLog = this.viewChangeLog.bind(this);
      this.languageDropdownBuilder = this.languageDropdownBuilder.bind(this);
    }

    onDebugClick(ev) {
      ev.preventDefault();
      this.renderer.renderTemplate('debuglog');
    }

    viewChangeLog(ev) {
      ev.preventDefault();
      this.renderer.renderTemplate('changelog');
    }

    warningDiv() {
      const regionName = this.app.util.regionlist.getSelectedRegion().localizedName();
      if (this.app.proxy.enabled()) {
        return (
          <div className="settingswarning-connected noselect">
            { t('SettingsWarningConnected', { browser: app.buildinfo.browser, region: regionName }) }
          </div>
        );
      }

      return (
        <div className="settingswarning-disconnected noselect">
          { t('SettingsWarning') }
        </div>
      );
    }

    gitInfo() {
      const { gitcommit, gitbranch } = this.app.buildinfo;
      const numValidHashes = [gitcommit, gitbranch]
        .filter((e) => { return e && (/^[a-zA-Z0-9\-.]+$/).test(e); })
        .length;

      if (numValidHashes === 2) {
        return (
          <div className="gitinfo">
            <div className="row">
              <span className="branch col-xs-2">
                Branch
              </span>
              <span className="gitbranch">
                { gitbranch }
              </span>
            </div>
            <div className="row">
              <span className="branch col-xs-2">
                Commit
              </span>
              <span className="gitbranch">
                { gitcommit }
              </span>
            </div>
          </div>
        );
      }

      return null;
    }

    languageDropdownBuilder() {
      const LanguageDropDown = this.languageDropdown;
      return (
        <div className="field settingitem noselect">
          <div className="col-xs-6 settingblock">
            <label htmlFor="languages" className="macetooltip">
              { t('UILanguage') }
              <div className="popover arrow-bottom">
                { t('UILanguageTooltip') }
              </div>
            </label>
          </div>
          <div className="col-xs-6 checkbox-container">
            <LanguageDropDown />
          </div>
        </div>
      );
    }

    render() {
      const GitInfo = this.gitInfo;
      const WarningDiv = this.warningDiv;

      return (
        <div id="settings-template" className="row">
          <OfflineWarning />

          <div className="top-border" id="settings">
            <PageTitle
              previousTemplate="authenticated"
              text={t('ChangeExtensionSettings')}
            />
            <WarningDiv />
            <SettingSections
              app={this.app}
              onDebugClick={this.onDebugClick}
              languageDropdownBuilder={this.languageDropdownBuilder}
            />
            <div className="sectionwrapper bypass">
              <BypassSettingSection />
            </div>
            <div className="field panelfooter">
              <div className="col-xs-12 settingblock">
                v
                { this.app.buildinfo.version }
                &nbsp;
                (
                <a href="#" onClick={this.viewChangeLog}>View Changelog</a>
                )
                <GitInfo />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
}
