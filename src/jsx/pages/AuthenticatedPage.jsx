import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Switch from '@component/Switch';
import Drawer from '@component/drawer/Drawer';
import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';
import DrawerOutlet from '@component/drawer/DrawerOutlet';
import SettingsDisclaimer from '@component/SettingsDisclaimer';
import DrawerHandle from '../component/drawer/DrawerHandle';

const SETTINGS_DISCLAIMER_KEY = 'app::settingsDisclaimerDismissed';
const INCOGNITO_DISCLAIMER_KEY = 'app::incognitoDisclaimerDismissed'

class AuthenticatedPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.mounted = false;
    this.debounce = null;
    this.app = props.context.app;
    this.proxy = this.app.proxy;
    this.storage = this.app.util.storage;
    this.settings = this.app.util.settings;
    this.regionlist = this.app.util.regionlist;
    this.state = {
      mode: '',
      error: '',
      drawerOpen: false,
      enabled: this.proxy.enabled(),
      tiles: this.storage.getItem('tiles'),
      settingsDisclaimerDismissed: this.getSettingsDisclaimerDismissed('settings'),
      incognitoDisclaimerDismissed: this.getSettingsDisclaimerDismissed('incognito'),
    };

    // bindings
    this.onToggleDrawer = this.onToggleDrawer.bind(this);
    this.onQuickConnect = this.onQuickConnect.bind(this);
    this.toggleTileSaved = this.toggleTileSaved.bind(this);
    this.onToggleConnection = this.onToggleConnection.bind(this);
    this.handleProxyConnection = this.handleProxyConnection.bind(this);
    this.getSettingsDisclaimerDismissed = this.getSettingsDisclaimerDismissed.bind(this);
    this.dismissSettingsDisclaimer = this.dismissSettingsDisclaimer.bind(this);

    // default tiles
    const defaultTiles = [
      { name: 'RegionTile', saved: true },
      { name: 'QuickConnect', saved: false },
      { name: 'Subscription', saved: false },
      { name: 'QuickSettings', saved: false },
      { name: 'BypassRules', saved: false },
      { name: 'Ip', saved: false },
    ];

    // ensure each tile from storage still exists
    let { tiles } = this.state;
    if (tiles && tiles.length) {
      // remove any tiles that don't exist
      tiles = tiles.filter((tile) => {
        return defaultTiles.some((defaultTile) => {
          return tile.name === defaultTile.name;
        });
      });

      // add any new default tiles
      defaultTiles.forEach((defaultTile) => {
        const foundTile = tiles.find((tile) => {
          return tile.name === defaultTile.name;
        });
        if (!foundTile) { tiles.push(defaultTile); }
      });
    }
    // default tile data if no tile data found
    else { tiles = defaultTiles; }

    // reset state.tiles
    this.state.tiles = tiles;
  }

  onToggleDrawer() {
    const { drawerOpen } = this.state;
    this.setState({ drawerOpen: !drawerOpen });
  }

  onToggleConnection() {
    // debounce the calls to the proxy handler by 175ms
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => { this.handleProxyConnection(); }, 175);
  }

  onQuickConnect(regionId) {
    this.regionlist.setSelectedRegion(regionId);
    this.setState({ mode: 'connecting' });

    return this.proxy.enable()
      .then((proxy) => {
        // artificial delay to allow animation to shine
        setTimeout(() => { this.setState({ enabled: proxy.enabled(), mode: '' }); }, 500);
      })
      .catch((err) => {
        debug(err);
        this.error = t('UnknownProxyError');
      });
  }

  getSettingsDisclaimerDismissed(what) {
    const objValues ={
      settings:SETTINGS_DISCLAIMER_KEY,
      incognito:INCOGNITO_DISCLAIMER_KEY
    }
    const { app: { util: { storage } } } = this;
    const value = storage.getItem(SETTINGS_DISCLAIMER_KEY);
    return value;
  }


  dismissSettingsDisclaimer(what) {
    const objValues ={
      settings:{
        value:SETTINGS_DISCLAIMER_KEY,
        objState:{settingsDisclaimerDismissed: true}
      },
      incognito:{
        value:INCOGNITO_DISCLAIMER_KEY,
        objState:{incognitoDisclaimerDismissed: true}
      }
    }
    const { app: { util: { storage } } } = this;
    storage.setItem(objValues[what].value, true);
    this.setState(() => {
      return objValues[what].objState;
    });
  }
  
  //Here seems to be the problem
  // dismissSettingsDisclaimer() {
  //   const { app: { util: { storage } } } = this;
  //   storage.setItem(SETTINGS_DISCLAIMER_KEY, true);
  //   this.setState(() => {
  //     return { settingsDisclaimerDismissed: true };
  //   });
  // }

  handleProxyConnection() {
    let promise;
    this.setState({ mode: 'connecting' });
    

    if (this.proxy.enabled()) { promise = this.proxy.disable(); }
    else { promise = this.proxy.enable(); }

    return promise
      .then((proxy) => {
        // artificial delay to allow animation to shine
        setTimeout(() => { this.setState({ enabled: proxy.enabled(), mode: '' }); }, 500);
      })
      .catch((err) => {
        debug(err);
        this.error = t('UnknownProxyError');
      });
  }

  toggleTileSaved(name, saved) {
    const { tiles } = this.state;
    const filteredTiles = tiles.filter((tile) => {
      return tile.name !== name;
    });

    filteredTiles.push({ name, saved });

    // save to storage
    this.storage.setItem('tiles', filteredTiles);

    this.setState({ tiles: filteredTiles });
  }

  render() {
    const {
      mode,
      tiles,
      enabled,
      drawerOpen,
      settingsDisclaimerDismissed,
      incognitoDisclaimerDismissed
    } = this.state;
    const { context: { theme } } = this.props;
    let { error } = this.state;
    let connection = enabled ? 'connected' : 'disconnected';

    // handle proxy errors
    const regions = this.regionlist.toArray();
    const hasRegions = this.regionlist.hasRegions();
    const region = this.regionlist.getSelectedRegion();
    if (!hasRegions) { error = t('NoRegionSelected'); } // put 'no region' error above all others
    if (error) { connection = 'error'; }

    // filter tiles
    const savedTiles = tiles.filter((tile) => { return tile.saved; });
    const unsavedTiles = tiles.filter((tile) => { return !tile.saved; });

    return (
      <div id="authenticated-page" className="row">
        <CompanyLogo mode={mode} error={error} connection={connection} />

        <div className={`connection ${theme}`}>
          <div className={`switch-container ${drawerOpen ? 'closed' : ''}`}>
            <Switch
              mode={mode}
              theme={theme}
              region={region}
              regions={regions}
              connection={connection}
              onToggleConnection={this.onToggleConnection}
            />
          </div>
          
          { !settingsDisclaimerDismissed && (
            <SettingsDisclaimer
              whichDisclaimer={'settingDisclaimer'}
              onDismiss={this.dismissSettingsDisclaimer}
              theme={theme}
            />
          ) }

          { !incognitoDisclaimerDismissed && (
            <SettingsDisclaimer
              whichDisclaimer={'incognitoDisclaimer'}
              onDismiss={this.dismissSettingsDisclaimer}
              theme={theme}
            />
          ) }

          <div className="authenticated-tiles">
            <DrawerOutlet
              mode={mode}
              region={region}
              regions={regions}
              tiles={savedTiles}
              connection={connection}
              drawerOpen={drawerOpen}
              toggleTileSaved={this.toggleTileSaved}
              onQuickConnect={this.onQuickConnect}
            />

            <Drawer
              mode={mode}
              region={region}
              regions={regions}
              open={drawerOpen}
              tiles={unsavedTiles}
              connection={connection}
              toggleTileSaved={this.toggleTileSaved}
              onQuickConnect={this.onQuickConnect}
            />
          </div>
        </div>

        <DrawerHandle theme={theme} open={drawerOpen} onToggleDrawer={this.onToggleDrawer} />
      </div>
    );
  }
}

AuthenticatedPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(AuthenticatedPage);
