import React, { Component } from 'react';
import PageTitle from '../component/PageTitle';
import OfflineWarning from '../component/OfflineWarning';
import SettingSections from '../component/SettingSections';
import LanguageDropdown from '../component/LanguageDropdown';
import BypassSettingSection from '../component/bypasslist/BypassSettingSection';

export default function () {
  return class SettingsTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.renderer = background.renderer;
      this.app = background.app;

      // properties
      this.buildinfo = this.app.buildinfo;
      this.languageDropdown = LanguageDropdown;
      this.regionlist = this.app.util.regionlist;

      // bindings
      this.gitInfo = this.gitInfo.bind(this);
      this.warningDiv = this.warningDiv.bind(this);
      this.onDebugClick = this.onDebugClick.bind(this);
      this.viewChangeLog = this.viewChangeLog.bind(this);
      this.languageDropdownBuilder = this.languageDropdownBuilder.bind(this);
    }

    onDebugClick() {
      return this.renderer.renderTemplate('debuglog');
    }

    viewChangeLog() {
      return this.renderer.renderTemplate('changelog');
    }

    warningDiv() {
      const region = this.app.util.regionlist.getSelectedRegion();

      if (region && this.app.proxy.enabled()) {
        const regionName = region.localizedName();
        return (
          <div className="settingswarning-connected noselect">
            { t('SettingsWarningConnected', { browser: this.buildinfo.browser, region: regionName }) }
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
      const { gitcommit, gitbranch } = this.buildinfo;
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
              onDebugClick={this.onDebugClick}
              languageDropdownBuilder={this.languageDropdownBuilder}
            />

            <div className="sectionwrapper bypass">
              <BypassSettingSection />
            </div>

            <div className="field panelfooter">
              <div className="col-xs-12 settingblock">
                v
                { this.buildinfo.version }
                &nbsp;
                (
                <a href="#changelog" onClick={this.viewChangeLog}>
                  View Changelog
                </a>
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
