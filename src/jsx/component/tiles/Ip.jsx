import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Tile from '@component/tiles/Tile';
import withAppContext from '@hoc/withAppContext';

function IpTile(props) {
  const {
    saved,
    hideFlag,
    toggleTileSaved,
    context: {
      theme,
      app: {
        util: { ipManager },
      },
    },
  } = props;
  const { realIP, proxyIP } = ipManager.getIPs();

  return (
    <Tile
      name="Ip"
      saved={saved}
      hideFlag={hideFlag}
      toggleTileSaved={toggleTileSaved}
    >
      <div className={`ip-tile-content ${theme}`}>
        <div className="real ip-section">
          <div className="title">{ t('IpReal') }</div>
          <div className="value">{ realIP || '-' }</div>
        </div>
        <div className="proxy ip-section">
          <div className="title">{ t('IpProxy') }</div>
          <div className="value">{ proxyIP || '-' }</div>
        </div>
      </div>
    </Tile>
  );
}

IpTile.propTypes = {
  context: PropTypes.object.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
  saved: PropTypes.bool.isRequired,
};

export default withAppContext(IpTile);
