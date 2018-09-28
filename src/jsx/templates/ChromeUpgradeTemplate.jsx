import React, { Component } from 'react';
import CompanyLogo from '../component/CompanyLogo';
import OfflineWarning from '../component/OfflineWarning';

export default function () {
  return class ChromeUpgradeTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.app = background.app;

      // properties
      this.buildinfo = this.app.buildinfo;
    }

    render() {
      return (
        <div className="chrome-upgrade-template row">
          <OfflineWarning />

          <CompanyLogo />
          <div className="top-border">
            <div className="warningicon" />

            <p className="warningtext">
              { t('UpgradeBrowserMessage', { browser: this.buildinfo.browser }) }
            </p>

            <p className="btn-center">
              <button
                type="button"
                className="btn btn-success"
                onClick={window.close}
              >
                { t('CloseText') }
              </button>
            </p>
          </div>
        </div>
      );
    }
  };
}
