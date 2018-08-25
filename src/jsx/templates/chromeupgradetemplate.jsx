import React from 'react';
import CompanyLogo from '../component/companylogo';

export default function (renderer, app) {
  const ChromeUpgradeTemplate = () => {
    return (
      <div>
        <CompanyLogo />
        <div className="top-border">
          <div className="warningicon" />
          <p className="warningtext">
            { t('UpgradeBrowserMessage', { browser: app.buildinfo.browser }) }
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
  };

  return ChromeUpgradeTemplate;
}
