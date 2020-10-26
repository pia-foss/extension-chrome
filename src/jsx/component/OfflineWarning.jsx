import React from 'react';
import PropTypes from 'prop-types';
import listenOnline from '@hoc/listenOnline';

const OfflineWarning = ({ online }) => {
  return (
    !online ? (
      <div className="offline-warning">
        { t('NoNetworkConnection') }
      </div>
    ) : ''
  );
};

OfflineWarning.propTypes = {
  online: PropTypes.bool.isRequired,
};

export default listenOnline(OfflineWarning);
