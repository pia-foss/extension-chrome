import React from 'react';
import { Route, Switch } from 'react-router-dom';

import LoginPage from '@pages/LoginPage';
import UpgradePage from '@pages/UpgradePage';
import SettingsPage from '@pages/SettingsPage';
import ExtraFeaturesPage from '@pages/ExtraFeaturesPage';
import DebugLogPage from '@pages/DebugLogPage';
import ChangelogPage from '@pages/ChangeLogPage';
import BypassListPage from '@pages/BypassListPage';
import ChangeRegionPage from '@pages/ChangeRegionPage';
import AuthenticatedPage from '@pages/AuthenticatedPage';
import UncontrollablePage from '@pages/UncontrollablePage';
import RegionOverridePage from '@pages/RegionOverridePage';
import PrivateRoute from './PrivateRoute';
import SmartLocationPage from '@pages/SmartLocationPage';
import PrivateBrowsingPage from '@pages/PrivateBrowsingPage';


export const Path = {
  authenticated: '/',
  login: '/login',
  upgrade: '/upgrade',
  debugLog: '/debuglog',
  uncontrollable: '/uncontrollable',
  regionOverride: '/override',
  changeRegion: '/region',
  settings: '/settings',
  extraFeatures: '/extrafeatures',
  changelog: '/changelog',
  bypassList: '/bypasslist',
  privateBrowsing: '/private-browsing',
  smartLocation:'/smartlocation'
};

/**
 * Context can be found:
 * in Render if using: Router.contextType = AppContext;
 * in this.props.context if using AppConextInjector(Router)
 */
const Routes = () => {
  return (
    <Switch>
      <PrivateRoute path={Path.authenticated} exact component={AuthenticatedPage} />
      <Route path={Path.login} component={LoginPage} />
      <Route path={Path.upgrade} component={UpgradePage} />
      <Route path={Path.debugLog} component={DebugLogPage} />
      <Route path={Path.uncontrollable} component={UncontrollablePage} />
      <Route path={Path.regionOverride} component={RegionOverridePage} />
      <PrivateRoute path={Path.changeRegion} component={ChangeRegionPage} />
      <PrivateRoute path={Path.settings} component={SettingsPage} />
      <PrivateRoute path={Path.extraFeatures} component={ExtraFeaturesPage} />
      <PrivateRoute path={Path.changelog} component={ChangelogPage} />
      <PrivateRoute path={Path.bypassList} component={BypassListPage} />
      <PrivateRoute path={Path.privateBrowsing} component={PrivateBrowsingPage} />
      <PrivateRoute path={Path.smartLocation} component={SmartLocationPage} />
      <Route component={LoginPage} />
    </Switch>
  );
};

export default Routes;
