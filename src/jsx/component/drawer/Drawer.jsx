import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';
import RegionTile from '@component/tiles/RegionTile';
import BypassRules from '@component/tiles/BypassRules';
import QuickConnect from '@component/tiles/QuickConnect';
import Subscription from '@component/tiles/Subscription';
import QuickSettings from '@component/tiles/QuickSettings';
import Ip from '@component/tiles/Ip';

class Drawer extends Component {
  constructor(props) {
    super(props);

    // bindings
    this.composeTiles = this.composeTiles.bind(this);
  }

  composeTiles() {
    const {
      mode,
      tiles,
      region,
      regions,
      connection,
      toggleTileSaved,
      onQuickConnect,
    } = this.props;

    return tiles.map((tile) => {
      switch (tile.name) {
        case 'RegionTile':
          return (
            <RegionTile
              key={tile.name}
              region={region}
              regions={regions}
              hideFlag={false}
              saved={tile.saved}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'QuickConnect':
          return (
            <QuickConnect
              key={tile.name}
              mode={mode}
              region={region}
              regions={regions}
              hideFlag={false}
              saved={tile.saved}
              connection={connection}
              toggleTileSaved={toggleTileSaved}
              onQuickConnect={onQuickConnect}
            />
          );

        case 'QuickSettings':
          return (
            <QuickSettings
              key={tile.name}
              hideFlag={false}
              saved={tile.saved}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'Subscription':
          return (
            <Subscription
              key={tile.name}
              hideFlag={false}
              saved={tile.saved}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'BypassRules':
          return (
            <BypassRules
              key={tile.name}
              hideFlag={false}
              saved={tile.saved}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'Ip':
          return (
            <Ip
              key={tile.name}
              hideFlag={false}
              saved={tile.saved}
              toggleTileSaved={toggleTileSaved}
            />
          );

        default:
          return undefined;
      }
    });
  }

  render() {
    const tiles = this.composeTiles();
    const { open, context: { theme } } = this.props;
    let drawerStyle = {};
    if (open) { drawerStyle = { maxHeight: `${(tiles.length * 85) + 30}px` }; }

    return (
      <div className={`drawer ${theme}`}>
        <div className="drawer-renderable" style={drawerStyle}>
          <div className="drawer-header">
            { t('DefaultDisplay') }
          </div>

          <div className="drawer-tiles">
            { tiles }
          </div>
        </div>
      </div>
    );
  }
}

Drawer.propTypes = {
  regions: PropTypes.array,
  region: PropTypes.object,
  open: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  tiles: PropTypes.array.isRequired,
  context: PropTypes.object.isRequired,
  connection: PropTypes.string.isRequired,
  onQuickConnect: PropTypes.func.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

Drawer.defaultProps = {
  regions: [],
  region: undefined,
};

export default withAppContext(Drawer);
