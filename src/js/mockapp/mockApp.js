import SameApp from '../sameApp';

import User from '@util/user';
import Icon from '@util/icon';
import I18n from '@util/i18n';
import Logger from '@util/logger';
import Storage from '@firefoxsettings/storage';
import Counter from '@util/counter';
import Settings from '@util/settings';
import ErrorInfo from '@util/errorinfo';
import BuildInfo from '@util/buildinfo';
import RegionList from '@util/regionlist';
import BypassList from '@util/bypasslist';
import LatencyManager from '@util/latencymanager';
import PlatformInfo from '@util/platforminfo';
import RegionSorter from '@util/regionsorter';
import SettingsManager from '@util/settingsmanager';
import SmartLocation from '@util/smart-location';
import IpManager from '@util/ipmanager';

import WebRTC from '@firefoxsettings/webrtc';
import HttpReferer from '@firefoxsettings/httpreferer';
import HyperlinkAudit from '@firefoxsettings/hyperlinkaudit';
import NetworkPrediction from '@firefoxsettings/networkprediction';
import TrackingProtection from '@firefoxsettings/trackingprotection';
import FingerprintProtection from '@firefoxsettings/fingerprintprotection';
// import BrowserProxy from '@chromesettings/proxy';
import UrlParser from '@helpers/url-parser';
import BrowserProxy from './mockProxy';

import {
  Target,
  isTarget,
  sendMessage,
  Type,
} from '@helpers/messagingFirefox';

export default class MockApp {
  constructor() {
    // create app object
    this.target = Target.BACKGROUND;
    this.logger = new Logger(this);
    this.buildinfo = new BuildInfo(this);
    window.debug = this.logger.debug;
    
    this.contentsettings = Object.create(null);
    
    this.chromesettings = Object.create(null);
    this.chromesettings.webrtc = new WebRTC(this);
    this.chromesettings.httpreferer = new HttpReferer(this);
    this.chromesettings.hyperlinkaudit = new HyperlinkAudit(this);
    this.chromesettings.networkprediction = new NetworkPrediction(this);
    this.chromesettings.trackingprotection = new TrackingProtection(this);
    this.chromesettings.fingerprintprotection = new FingerprintProtection(this);
    this.chromesettings = Object.freeze(this.chromesettings);
    
    this.proxy = new BrowserProxy(this, true);
    
    this.adapter = this;
    
    this.util = Object.create(null);
    this.util.storage = new Storage(this);
    this.util.platforminfo = new PlatformInfo(this);
    this.util.settings = new Settings(this);
    this.util.regionlist = new RegionList(this, true);
    this.util.bypasslist = new BypassList(this, true);
    this.util.counter = new Counter(this);
    this.util.latencymanager = new LatencyManager(this);
    this.util.regionsorter = new RegionSorter(this);
    this.util.settingsmanager = new SettingsManager(this);
    this.util.icon = new Icon(this);
    this.util.user = new User(this, true);
    this.util.i18n = new I18n(this);
    this.util.errorinfo = new ErrorInfo(this);
    this.util.smartlocation = new SmartLocation(this,true);
    this.util.ipManager = new IpManager(this);
    this.util = Object.freeze(this.util);
    this.helpers = Object.create(null);
    this.helpers.UrlParser = new UrlParser(); 
    this.helpers = Object.freeze(this.helpers);
    this.sameApp = new SameApp(this);

    // NOTE: Do not initialize the bypass list here,
    // it will be taken care of in the initialize function below

    // TODO: doesn't work because of babel running too late
    // this.eventhandler = new eventhandler(self);

    // bindings
    this.initialize = this.initialize.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);


    // message handling
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  async initialize() {
    try {
      const app = await this.sendMessage('initialize');

      // Initialize settings
      if (app) {
        // initialize settings localStorage
        // it is critical the settings are intiialized before setting up the user
        // to ensure 'remember me' is set and user credentials are saved to the
        // correct storage location via setUsername
        app.util.settings.forEach(({ settingID, value }) => {
          this.util.settings.setItem(settingID, value, true);
        });
      }
      const reflect = (pr) => {
        return pr
          .then(() => {})
          .catch((err) => { debug(`background.js: ${err.message || err}`); });
      };
      const pendingInit = Object.values(this.chromesettings)
        .map((setting) => { return setting.init(); })
        .map(reflect);
      await Promise.all(pendingInit);
      
      if (app) {
        // set user, proxy, and region values
        this.util.smartlocation.saveToStorage('smartLocationRules',app.util.smartlocation.smartLocationRules,true);
        this.util.smartlocation.saveToStorage('checkSmartLocation',app.util.smartlocation.checkSmartLocation,true);
        this.proxy.setLevelOfControl(app.proxy.levelOfControl);

        if(app.proxy.enabled) this.proxy.enable();
        else this.proxy.disable();
        this.util.user.setLoggedIn(app.util.user.loggedIn);
        this.util.user.setUsername(app.util.user.username);
        this.util.user.setAccount(app.util.user.account);
        this.util.user.setAuthToken(app.util.user.authToken);
        this.util.storage.setItem('online', app.online);
        this.util.regionlist.import(app.util.regionlist.regions);
        this.util.regionlist.setIsAuto(app.util.regionlist.isAuto);
        this.util.regionlist.importAutoRegion(app.util.regionlist.autoRegion);
        await this.util.regionlist.setSelectedRegion(app.util.regionlist.region.id, true);
        this.util.regionlist.resetFavoriteRegions(app.util.regionlist.favorites);
        
        // save tile and drawerOpen state to storage
        if (app.tiles) { this.util.storage.setItem('tiles', app.tiles); }
        if (app.drawerState) { this.util.storage.setItem('drawerState', app.drawerState); }
        
        // set bypasslist rules
        const userRuleKey = this.util.bypasslist.storageKeys.userrk;
        const popRuleKey = this.util.bypasslist.storageKeys.poprk;
        this.util.storage.setItem(userRuleKey, app.util.bypasslist.user);
        this.util.storage.setItem(popRuleKey, app.util.bypasslist.popular);
        this.util.bypasslist.resetPopularRules();
      }
      

      await this.proxy.init();
      await this.sameApp.init();
    }
    catch (err) {
      debug('mockApp.js: error occurred');
      debug(`error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    }
  }

  async sendMessage(type, data) {
    let message;
    try { message = await sendMessage(this.target, type, data); }
    catch (err) {
      debug('mockApp.js: error');
      debug(`error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }

    return message;
  }

  handleMessage(message, response) {
    if (!isTarget(message, Target.FOREGROUND)) { return false; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a 'real' promise
    new Promise(async (resolve) => {
      if (message.type === Type.SET_SELECTED_REGION) {
        await this.util.regionlist.setSelectedRegion(message.data.id, true);
      }
      else if (message.type === Type.IMPORT_AUTO_REGION) {
        await this.util.regionlist.importAutoRegion(message.data);
      }
      else if (message.type === Type.IMPORT_REGIONS) {
        await this.util.regionlist.import(message.data);
      }

      return resolve({});
    })
      .then(response)
      .catch(() => { return response(false); });

    // must return true here to keep the response callback alive
    return true;
  }
}
