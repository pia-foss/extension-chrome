import {
  Type,
  Target,
  isTarget,
  sendMessage,
  Namespace,
} from '@helpers/messagingFirefox';

export default class MockAppAdapter {
  constructor(app) {
    // properties
    this.app = app;
    this.target = Target.FOREGROUND;

    // bindings
    this.initialize = this.initialize.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleRegionList = this.handleRegionList.bind(this);
    console.log('SENT MESSAGE -------------',this.handleMessage);
    // handle listener
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  handleMessage(message, sender, response) {
    if (!isTarget(message, Target.BACKGROUND)) { return false; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a "real" promise
    new Promise((resolve) => {
      let res = {};

      if (message.type === 'initialize') {
        res = this.initialize();
      }
      else if (message.type === 'util.user.setUsername') {
        const { username } = message.data;
        this.app.util.user.setUsername(username);
      }
      else if (message.type === 'util.user.setAccount') {
        this.app.util.user.setAccount(message.data);
      }
      else if (message.type === 'util.user.setRememberMe') {
        const { rememberMe } = message.data;
        this.app.util.user.setRememberMe(rememberMe);
      }
      else if (message.type === 'util.user.setLoggedIn') {
        const { value } = message.data;
        this.app.util.user.setLoggedIn(value);
      }
      else if (message.type === 'util.user.setAuthToken') {
        const { authToken } = message.data;
        this.app.util.user.setAuthToken(authToken);
      }
      else if (message.type === 'updateSettings') {
        const { settingID, value } = message.data;
        this.app.util.settings.setItem(settingID, value, true);
      }
      else if (message.type === 'smartLocation') {
        const { settingID, value } = message.data;
        this.app.util.smartlocation.saveToStorage(settingID, value, true);
      }  else if (message.type === 'sameApp') {
        const { settingID } = message.data;
        this.app.sameApp.saveToStorage(settingID,value, true);
      } else if (message.type === 'util.settings.toggle') {
        const { settingID } = message.data;
        this.app.util.settings.toggle(settingID, true);
      }
      else if (message.type === 'enablePopularRule') {
        if (message.data.restartProxy === false) {
          this.app.util.bypasslist.enablePopularRule(message.data.name, true, false);
        }
        else {
          this.app.util.bypasslist.enablePopularRule(message.data.name, true);
        }
      }
      else if (message.type === 'disablePopularRule') {
        if (message.data.restartProxy === false) {
          this.app.util.bypasslist.disablePopularRule(message.data.name, true, false);
        }
        else {
          this.app.util.bypasslist.disablePopularRule(message.data.name, true);
        }
      }
      else if (message.type === 'setUserRules') {
        this.app.util.bypasslist.setUserRules(message.data, true);
      }
      else if (message.type === 'tiles') {
        this.app.util.storage.setItem('tiles', JSON.stringify(message.data));
      }
      else if (message.type === 'drawerState') {
        this.app.util.storage.setItem('drawerState', message.data);
      }
      else if (message.type === Type.DEBUG) {
        const { data: { debugMsg } } = message;
        debug(debugMsg);
      }
      else if (message.type.startsWith(Namespace.REGIONLIST)) {
        res = this.handleRegionList(message);
      }
      else if (message.type.startsWith(Namespace.PROXY)) {
        res = this.handleProxyMessage(message);
      }
      else if (message.type.startsWith(Namespace.BYPASSLIST)) {
        res = this.handleBypasslistMessage(message);
      }
      else if (message.type.startsWith(Namespace.I18N)) {
        res = this.handleI18nMessage(message);
      }

      return resolve(res);
    })
      .then(response)
      .catch(() => { return response(false); });

    // must return true here to keep the response callback alive
    return true;
  }

  handleI18nMessage(message) {
    return Promise.resolve(message)
      .then(({ data, type }) => {
        const { util: { i18n } } = this.app;

        switch (type) {
          case Type.I18N_TRANSLATE: {
            const { key, opts = {} } = data;
            return i18n.t(key, opts);
          }

          default: throw new Error(`no handler for type ${type}`);
        }
      });
  }

  /**
   * Handle messages directed to regionlist
   */
  handleRegionList(message) {
    return Promise.resolve(message)
      .then(({ data, type }) => {
        const { regionlist } = this.app.util;

        switch (type) {
          case Type.SET_SELECTED_REGION: {
            const { id } = data;
            return regionlist.setSelectedRegion(id, true);
          }
          case Type.IMPORT_REGIONS: {
            return regionlist.import(data);
          }
          case Type.IMPORT_AUTO_REGION: {
            return regionlist.importAutoRegion(data, true);
          }
          case Type.SET_FAVORITE_REGION: {
            return regionlist.setFavoriteRegion(data, true);
          }
          case Type.ADD_OVERRIDE_REGION: {
            return regionlist.addOverrideRegion(data, true);
          }
          case Type.REMOVE_OVERRIDE_REGION: {
            return regionlist.removeOverrideRegion(data, true);
          }

          default: throw new Error(`no handler for ${type}`);
        }
      });
  }

  handleProxyMessage(message) {
    return Promise.resolve(message)
      .then(async ({ type }) => {
        const { proxy } = this.app;

        switch (type) {
          case Type.PROXY_ENABLE: {
            await proxy.enable();
            return;
          }

          case Type.PROXY_DISABLE: {
            await proxy.disable();
            return;
          }

          default: throw new Error(`no handler for type '${type}'`);
        }
      });
  }


  handleBypasslistMessage(message) {
    return Promise.resolve(message)
      .then(async ({ type, data }) => {
        const { util: { bypasslist } } = this.app;

        switch (type) {
          case Type.DOWNLOAD_BYPASS_JSON: {
            await bypasslist.saveRulesToFile();
            return;
          }

          case Type.IMPORT_RULES: {
            const { rules } = data;
            bypasslist.importRules(rules);
          }

          default: throw new Error(`no handler for type: ${type}`);
        }
      });
  }

  initialize() {
    const isAuto = this.app.util.regionlist.getIsAuto();
    const regionId = this.app.util.regionlist.getSelectedRegion().id;
    const id = isAuto ? 'auto' : regionId;
    const payload = {
      proxy: {
        levelOfControl: this.app.proxy.getLevelOfControl(),
        enabled: this.app.proxy.enabled()
      },
      online: this.app.util.storage.getItem('online'),
      util: {
        user: {
          account: this.app.util.user.account,
          loggedIn: this.app.util.user.loggedIn,
          username: this.app.util.user.getUsername(),
          authToken: this.app.util.user.getAuthToken(),
        },
        regionlist: {
          region: { id },
          regions: this.app.util.regionlist.export(),
          isAuto: this.app.util.regionlist.getIsAuto(),
          autoRegion: this.app.util.regionlist.exportAutoRegion(),
          favorites: this.app.util.storage.getItem('favoriteregions'),
        },
        bypasslist: {
          user: this.app.util.bypasslist.getUserRules(),
          popular: this.app.util.bypasslist.enabledPopularRules().join(','),
        },
        smartlocation: {
          smartLocationRules: this.app.util.smartlocation.getSmartLocationRules('smartLocationRules'),
          checkSmartLocation: this.app.util.smartlocation.getSmartLocationRules('checkSmartLocation')
        },
        settings: this.app.util.settings.getAll(),
      },
      sameApp:{
        sameAppBrowser : this.app.sameApp.returnBrowser()
      }
    };

    const tiles = this.app.util.storage.getItem('tiles');
    const drawerState = this.app.util.storage.getItem('drawerState');
    if (tiles) {
      try { payload.tiles = tiles; }
      catch (err) { /* noop */ }
    }
    if (drawerState) {
      try { payload.drawerState = drawerState; }
      catch (err) { /* noop */ }
    }

    return payload;
  }

  sendMessage(type, data) {
    return sendMessage(this.target, type, data)
      .catch((err) => {
        if (!err.message) { throw err; }
        if (err.message.startsWith('Could not establish connection')) { return; }
        throw err;
      });
  }
}
