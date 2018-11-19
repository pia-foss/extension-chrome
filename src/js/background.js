import 'babel-polyfill';

import Storage from 'util/storage';
import Settings from 'util/settings';
import Icon from 'util/icon';
import RegionList from 'util/regionlist';
import RegionSorter from 'util/regionsorter';
import User from 'util/user';
import BypassList from 'util/bypasslist';
import LatencyTest from 'util/latencytest';
import BuildInfo from 'util/buildinfo';
import Logger from 'util/logger';
import Counter from 'util/counter';
import SettingsManager from 'util/settingsmanager';
import ErrorInfo from 'util/errorinfo';
import I18n from 'util/i18n';
import PlatformInfo from 'util/platforminfo';

import Microphone from 'contentsettings/microphone';
import Camera from 'contentsettings/camera';
import Location from 'contentsettings/location';
import Flash from 'contentsettings/flash';
import ExtensionNotification from 'contentsettings/extension_notification';

import HyperlinkAudit from 'chromesettings/hyperlinkaudit';
import WebRTC from 'chromesettings/webrtc';
import ThirdPartyCookies from 'chromesettings/thirdpartycookies';
import HttpReferer from 'chromesettings/httpreferer';
import NetworkPrediction from 'chromesettings/networkprediction';
import SafeBrowsing from 'chromesettings/safebrowsing';
import BrowserProxy from 'chromesettings/proxy';
import AutoFill from 'chromesettings/autofill';
import AutoFillCreditCard from 'chromesettings/autofillcreditcard';
import AutoFillAddress from 'chromesettings/autofilladdress';
import EventHandler from 'eventhandler/eventhandler';

// build background application (self)
const self = Object.create(null);
const deepFreeze = (obj) => {
  if(@@freezeApp) {
    for(let p in obj) {
      obj[p] = Object.freeze(obj[p]);
    }
  }
  return Object.freeze(obj);
};

// event handling and basic browser info gathering
self.frozen = @@freezeApp;
self.buildinfo = new BuildInfo(self);
self.logger = new Logger(self);
self.eventhandler = new EventHandler(self);

// attach debugging to global scope
window.debug = self.logger.debug;

// attach utility functions
self.util = Object.create(null);
self.util.platforminfo = new PlatformInfo(self);
self.util.icon = new Icon(self);
self.util.storage = new Storage(self);
self.util.settings = new Settings(self);
self.util.i18n = new I18n(self);
self.util.regionlist = new RegionList(self);
self.util.bypasslist = new BypassList(self);
self.util.counter = new Counter(self);
self.util.user = new User(self);
self.util.latencytest = new LatencyTest(self);
self.util.regionsorter = new RegionSorter(self);
self.util.settingsmanager = new SettingsManager(self);
self.util.errorinfo = new ErrorInfo(self);
self.util = Object.freeze(self.util);

/* self.proxy is a %{browser}Setting like self.chromesettings.* objects are. */
self.proxy = new BrowserProxy(self);
self.proxy.init();
self.util.bypasslist.init();

// attach browser specific functions
self.contentsettings = Object.create(null);
self.contentsettings.camera = new Camera(self);
self.contentsettings.microphone = new Microphone(self);
self.contentsettings.location = new Location(self);
self.contentsettings.flash = new Flash(self);
self.contentsettings.extensionNotification = new ExtensionNotification(self);

// attach chrome settings functions
self.chromesettings = Object.create(null);
self.chromesettings.networkprediction = new NetworkPrediction(self);
self.chromesettings.httpreferer = new HttpReferer(self);
self.chromesettings.hyperlinkaudit = new HyperlinkAudit(self);
self.chromesettings.webrtc = new WebRTC(self);
self.chromesettings.thirdpartycookies = new ThirdPartyCookies(self);
self.chromesettings.safebrowsing = new SafeBrowsing(self);
// new API starting w/ chrome 70
self.chromesettings.autofillcreditcard = new AutoFillCreditCard(self);
self.chromesettings.autofilladdress = new AutoFillAddress(self);
// old API, remove after chrome 70 reaches general availability
self.chromesettings.autofill = new AutoFill(self);

// Initialize all functions
const initSettings = (settings) => {
  return Object.values(settings)
    .filter((setting) => { return setting.init; })
    .forEach((setting) => { return setting.init(); });
};

initSettings(self.chromesettings);
initSettings(self.contentsettings);
self.util.settings.init();

// Freeze settings
self.contentsettings = deepFreeze(self.contentsettings);

// check if regions are set
const { regionlist } = self.util;
const regionsSet = regionlist.hasRegions();
if (!regionsSet) { regionlist.sync(); }

// check if proxy is controllable
const { proxy, util: { user } } = self;
const controllablePromise = proxy.readSettings()
  .then(() => { return proxy.isControllable(); })
  /* NOTE: controllable handling here should be ported to firefox */
  .then(async (controllable) => {
    const proxyOnline = self.util.storage.getItem('online') === 'true';
    if (user.loggedIn && user.logOutOnClose) {
      // Disable proxy before logging out to prevent auth dialogs
      await proxy.disable();
      await user.logout();
    }
    else if (user.loggedIn && proxyOnline && controllable) {
      await proxy.enable();
    }
    else {
      await proxy.disable();
    }
  })
  .catch((err) => {
    debug(err);
    return proxy.disable();
  });

window.app = Object.freeze(self);
debug('background.js: initialized');
