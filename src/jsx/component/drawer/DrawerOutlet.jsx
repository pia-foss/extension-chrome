import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';
import RegionTile from '@component/tiles/RegionTile';
import BypassRules from '@component/tiles/BypassRules';
import QuickConnect from '@component/tiles/QuickConnect';
import Subscription from '@component/tiles/Subscription';
import QuickSettings from '@component/tiles/QuickSettings';
import Ip from '@component/tiles/Ip';

class DrawerOutlet extends Component {
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
      drawerOpen,
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
              saved={tile.saved}
              hideFlag={!drawerOpen}
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
              saved={tile.saved}
              hideFlag={!drawerOpen}
              connection={connection}
              toggleTileSaved={toggleTileSaved}
              onQuickConnect={onQuickConnect}
            />
          );

        case 'QuickSettings':
          return (
            <QuickSettings
              key={tile.name}
              saved={tile.saved}
              hideFlag={!drawerOpen}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'Subscription':
          return (
            <Subscription
              key={tile.name}
              saved={tile.saved}
              hideFlag={!drawerOpen}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'BypassRules':
          return (
            <BypassRules
              key={tile.name}
              saved={tile.saved}
              hideFlag={!drawerOpen}
              toggleTileSaved={toggleTileSaved}
            />
          );

        case 'Ip':
          return (
            <Ip
              key={tile.name}
              saved={tile.saved}
              hideFlag={!drawerOpen}
              toggleTileSaved={toggleTileSaved}
            />
          );

        default:
          return undefined;
      }
    });
  }

  render() {
    const { context: { theme } } = this.props;

    return (
      <div className={`drawer-outlet ${theme}`}>
        { this.composeTiles() }
      </div>
    );
  }
}

DrawerOutlet.propTypes = {
  region: PropTypes.object,
  regions: PropTypes.array,
  tiles: PropTypes.array.isRequired,
  context: PropTypes.object.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
  onQuickConnect: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  connection: PropTypes.string.isRequired,
};

DrawerOutlet.defaultProps = {
  regions: [],
  region: undefined,
};

export default withAppContext(DrawerOutlet);
