import React from 'react';
import PropTypes from 'prop-types';

const LoadingEllipsis = ({ theme }) => {
  return (
    <div className={`loading-auto ${theme}`}>
      <span className="loading-auto-text">
        { t('CalculatingLatency') }
      </span>

      <div className="loading-auto-animation">
        <div className="loading">
          <span className="one">
            .
          </span>
          <span className="two">
            .
          </span>
          <span className="three">
            .
          </span>
        </div>

      </div>
    </div>
  );
};

LoadingEllipsis.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default LoadingEllipsis;
