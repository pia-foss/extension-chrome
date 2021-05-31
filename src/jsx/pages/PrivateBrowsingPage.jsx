import PropTypes from 'prop-types';
import React from 'react';

import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';

const PrivateBrowsingPage = (props) => {
  const { context: { theme } } = props;

  return (
    <div className={`private-browsing-page row ${theme}`}>
      <CompanyLogo hideLinks={true} />

      <div className="warningicon" />

      <p className="warningtext">
        { t('PrivateBrowsingChangeLead') }
      </p>

      <p className="warningtext">
        { t('PrivateBrowsingChangeDirections') }
      </p>

      <div className="addons">
        <div>
          URL:
        </div>

        <div>
          about:addons
        </div>
      </div>
    </div>
  );
};

PrivateBrowsingPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(PrivateBrowsingPage);
