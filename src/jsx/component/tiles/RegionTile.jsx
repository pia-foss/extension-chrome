import React from 'react';
import PropTypes from 'prop-types';

import Tile from '@component/tiles/Tile';
import CurrentRegion from '@component/CurrentRegion';

const RegionTile = (props) => {
  const {
    saved,
    region,
    regions,
    hideFlag,
    toggleTileSaved,
  } = props;

  return (
    <Tile
      name="RegionTile"
      saved={saved}
      hideFlag={hideFlag}
      toggleTileSaved={toggleTileSaved}
    >
      <CurrentRegion id="region" region={region} regions={regions} />
    </Tile>
  );
};

RegionTile.propTypes = {
  region: PropTypes.object,
  regions: PropTypes.array,
  saved: PropTypes.bool.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

RegionTile.defaultProps = {
  regions: [],
  region: undefined,
};

export default RegionTile;
