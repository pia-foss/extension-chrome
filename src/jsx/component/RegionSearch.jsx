import React from 'react';
import PropTypes from 'prop-types';

const RegionSearch = ({ theme, search, onSearchUpdate }) => {
  return (
    <div className={`region-search ${theme}`}>
      <input
        type="text"
        className="region-search-input"
        value={search}
        placeholder={t('RegionSearch')}
        onChange={onSearchUpdate}
      />
    </div>
  );
};

RegionSearch.propTypes = {
  theme: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  onSearchUpdate: PropTypes.func.isRequired,
};

export default RegionSearch;
