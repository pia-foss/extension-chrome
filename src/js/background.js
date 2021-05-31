import '@babel/polyfill';


import SameApp from './sameApp';

import Storage from '@util/storage';
import StorageFirefox from '@firefoxsettings/storage';
import Settings from '@util/settings';
import Icon from '@util/icon';
import RegionList from '@util/regionlist';
import RegionSorter from '@util/regionsorter';
import User from '@util/user';
import BypassList from '@util/bypasslist';
import SmartLocation from '@util/smart-location'
import LatencyManager from '@util/latencymanager';
import BuildInfo from '@util/buildinfo';
import Logger from '@util/logger';
import Counter from '@util/counter';
import SettingsManager from '@util/settingsmanager';
import ErrorInfo from '@util/errorinfo';
import I18n from '@util/i18n';
import PlatformInfo from '@util/platforminfo';
import HttpsUpgrade from '@util/https-upgrade';
import IpManager from '@util/ipmanager';

import MockAppAdapter from '@mockapp/mockAppAdapter';

import Microphone from '@contentsettings/microphone';
import Camera from '@contentsettings/camera';
import Location from '@contentsettings/location';
// import Flash from '@contentsettings/flash';
import ExtensionNotification from '@contentsettings/extension_notification';

import HyperlinkAudit from '@chromesettings/hyperlinkaudit';
import WebRTC from '@chromesettings/webrtc';
import ThirdPartyCookies from '@chromesettings/thirdpartycookies';
import HttpReferer from '@chromesettings/httpreferer';
import NetworkPrediction from '@chromesettings/networkprediction';
import SafeBrowsing from '@chromesettings/safebrowsing';
import BrowserProxy from '@chromesettings/proxy';
import AutoFill from '@chromesettings/autofill';
import AutoFillCreditCard from '@chromesettings/autofillcreditcard';
import AutoFillAddress from '@chromesettings/autofilladdress';

import BrowserFirefoxProxy from '@firefoxsettings/proxy';
import WebRTCFirefox from '@firefoxsettings/webrtc';
import NetworkPredictionFirefox from '@firefoxsettings/networkprediction';
import HttpRefererFirefox from '@firefoxsettings/httpreferer';
import HyperlinkAuditFirefox from '@firefoxsettings/hyperlinkaudit';
import TrackingProtectionFirefox from '@firefoxsettings/trackingprotection';
import FingerprintProtectionFirefox from '@firefoxsettings/fingerprintprotection';

import EventHandler from '@eventhandler/eventhandler';
import Courier from '@core/courier';
import Network from '@core/network';
import UrlParser from '@helpers/url-parser';
import { createSvgIcon } from '@material-ui/core';


function isFrozen() {
  return process.env.FREEZE_APP === true;
}
// build background application (self)
const self = Object.create(null);


(async () => {
  // create util
  self.util = Object.create(null);
  self.helpers = Object.create(null);
  
  // setup storage (core dependency of application)
  if(typeof browser == "undefined"){
    self.util.storage = new Storage(self);
    await self.util.storage.init();
  }else{
    self.util.storage = new StorageFirefox(self);
  }
  
  // event handling and basic browser info gathering
  self.frozen = isFrozen();
  self.buildinfo = new BuildInfo(self);
  self.logger = new Logger(self);
  
  // attach debugging to global scope
  window.debug = self.logger.debug;
  
  // attach other utility functions
  self.util.platforminfo = new PlatformInfo(self);
  self.util.icon = new Icon(self);
  self.util.settings = new Settings(self);
  self.util.i18n = new I18n(self);
  self.util.regionlist = new RegionList(self);
  self.util.bypasslist = new BypassList(self);
  self.util.smartlocation = new SmartLocation(self);
  self.util.counter = new Counter(self);
  self.util.user = new User(self);
  self.util.latencymanager = new LatencyManager(self);
  self.util.regionsorter = new RegionSorter(self);
  self.util.settingsmanager = new SettingsManager(self);
  self.util.errorinfo = new ErrorInfo(self);
  self.util.httpsUpgrade = new HttpsUpgrade(self);
  self.util.ipManager = new IpManager(self);
  self.util = Object.freeze(self.util);
  
  /* self.proxy is a %{browser}Setting like self.chromesettings.* objects are. */
  if(typeof browser == "undefined"){
    self.proxy = new BrowserProxy(self);
  }else{
    // message connection with foreground page
    
    self.adapter = new MockAppAdapter(self);
    self.proxy = new BrowserFirefoxProxy(self);
  }
  
  // setup event handler
  self.eventhandler = new EventHandler(self);
  
  self.contentsettings = Object.create(null);
  self.chromesettings = Object.create(null);

  if(typeof browser == "undefined"){
    // attach browser specific functions
    self.contentsettings.camera = new Camera(self);
    self.contentsettings.microphone = new Microphone(self);
    self.contentsettings.location = new Location(self);
    // self.contentsettings.flash = new Flash(self);
    self.contentsettings.extensionNotification = new ExtensionNotification(self);

      // attach chrome settings function
    self.chromesettings.networkprediction = new NetworkPrediction();
    self.chromesettings.httpreferer = new HttpReferer();
    self.chromesettings.hyperlinkaudit = new HyperlinkAudit();
    self.chromesettings.webrtc = new WebRTC();
    self.chromesettings.thirdpartycookies = new ThirdPartyCookies();
    self.chromesettings.safebrowsing = new SafeBrowsing();
    // new API starting w/ chrome 70
    self.chromesettings.autofillcreditcard = new AutoFillCreditCard(self.util.storage);
    self.chromesettings.autofilladdress = new AutoFillAddress(self.util.storage);
    // old API, remove after chrome 70 reaches general availability
    self.chromesettings.autofill = new AutoFill();
  }else{

    self.chromesettings = Object.create(null);
    self.chromesettings.webrtc = new WebRTCFirefox(self);
    self.chromesettings.networkprediction = new NetworkPredictionFirefox(self);
    self.chromesettings.httpreferer = new HttpRefererFirefox(self);
    self.chromesettings.hyperlinkaudit = new HyperlinkAuditFirefox(self);
    self.chromesettings.trackingprotection = new TrackingProtectionFirefox(self);
    self.chromesettings.fingerprintprotection = new FingerprintProtectionFirefox(self);

  }
  
  self.sameApp = new SameApp(self);
  
  // Initialize all functions
  const initSettings = async (settings) => {
    const pending = Object.values(settings)
    .filter((setting) => { return setting.init; })
    .map((setting) => { return setting.init(); });
    await Promise.all(pending);
  };
  
  await initSettings(self.chromesettings);
  await initSettings(self.contentsettings);
  
  // only initialize settings AFTER intializing chrome/content settings
  self.util.settings.init();
  
  // only initialize bypasslist AFTER settings
  self.util.bypasslist.init();
  
  self.util.smartlocation.init();
  
  // setup courier & network
  self.courier = new Courier();
  self.network = new Network(self);
  
  // trigger regionlist sync
  const { regionlist } = self.util;
  regionlist.sync();
  
  //Smart location on tab change
  self.helpers.UrlParser = new UrlParser();

  //when a tab is updated
  chrome.tabs.onUpdated.addListener((tabId)=>{
    self.util.icon.upatedOnChangeTab(tabId);
  })

  chrome.windows.onCreated.addListener(function() {
    self.util.user.checkUserName();
  })
  
  //When tabs are changed
  chrome.tabs.onActivated.addListener((activeInfo)=>{
    self.util.icon.upatedOnChangeTab(activeInfo.tabId);
  });


  // attach app to window
  window.app = Object.freeze(self);

  debug('background.js: mounted to window successfully');
  
  const { proxy,sameApp, util: { storage, user, ipManager } } = self;
  await user.init();
  if(typeof browser == "undefined"){
    await proxy.init();
    await proxy.readSettings();
  }
  await sameApp.init();

  const loggedIn = user.getLoggedIn().length > 0 ? JSON.parse(user.getLoggedIn()) : user.getLoggedIn();
  if (loggedIn && JSON.parse(storage.getItem('online')) && proxy.isControllable()) {
    await proxy.enable();
  }
  else {
    await proxy.disable();
    // trigger ip update
    ipManager.update({ retry: true });
  }
  debug('background.js: initialized successfully');
})().catch(async (err) => {
  if (debug) {
    debug('background.js: failed to initialize');
    debug(err);
  }
  if (self.proxy) {
    await self.proxy.disable();
  }
});

