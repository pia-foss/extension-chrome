import React from 'react';
import CompanyLogo from '../component/CompanyLogo';
import OfflineWarning from '../component/OfflineWarning';

export default function () {
  const PleaseWaitTemplate = () => {
    return (
      <div id="please-wait-template" className="row">
        <OfflineWarning />

        <CompanyLogo />

        <div className="top-border">
          <div className="loader" />

          <p className="loadingtext2">
            { t('PleaseWait') }
          </p>
        </div>
      </div>
    );
  };

  return PleaseWaitTemplate;
}
