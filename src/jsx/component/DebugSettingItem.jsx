import React from 'react';
import PropTypes from 'prop-types';

const DebugSettingItem = ({ onClick, theme }) => {
  return (
    <div className={`setting-item ${theme} noselect`}>
      <div className="dlviewbtn">
        <button
          type="button"
          className="btn btn-success"
          onClick={onClick}
        >
          { t('ViewDebugLog') }
        </button>
      </div>
    </div>
  );
};

DebugSettingItem.propTypes = {
  theme: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default DebugSettingItem;
