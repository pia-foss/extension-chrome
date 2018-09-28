import React from 'react';
import PropType from 'prop-types';

const DebugSettingItem = ({ onClick }) => {
  return (
    <div className="field settingitem noselect">
      <div className="col-xs-12 dlviewbtn">
        <button
          type="button"
          className="col-xs-12 btn btn-success"
          onClick={onClick}
        >
          { t('ViewDebugLog') }
        </button>
      </div>
    </div>
  );
};

DebugSettingItem.propTypes = {
  onClick: PropType.func.isRequired,
};

export default DebugSettingItem;
