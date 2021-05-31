import reportError from '@helpers/reportError';

/* Types

  interface AppSetting {
    settingDefault: boolean;
    settingID: string;
  }

  interface ContentSetting extends AppSetting {
    clearSetting(): void;
    applySetting(): void;
    isApplied(): boolean;
  }

  interface ChromeSetting extends ApiSetting {
    isApplied(): boolean;
    isControllable(): boolean;
  }

  type ApiSetting = ContentSetting | ChromeSetting;
*/

const ApplicationIDs = {
  BLOCK_PLUGINS: 'blockplugins',
  BLOCK_UTM: 'blockutm',
  BLOCK_FBCLID: 'blockfbclid',
  MACE_PROTECTION: 'maceprotection',
  DEBUG_MODE: 'debugmode',
  REMEMBER_ME: 'rememberme',
  FIRST_RUN: 'firstRun',
  DARK_THEME: 'darkTheme',
  HTTPS_UPGRADE: 'httpsUpgrade',
  ALWAYS_ON: 'alwaysActive',
};

/**
 * Keep track of the status of various settings
 * in the extension
 */
class Settings {
  constructor(app) {
    // properties
    this.app = app;
    this.appDefaults = Settings.appDefaults;

    // bindings
    this.init = this.init.bind(this);
    this.hasItem = this.hasItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getControllable = this.getControllable.bind(this);
    this.enabled = this.enabled.bind(this);
  }

  /* App Getters */

  get contentSettings() { 
    const contentSettings = this.app.contentsettings ? this.app.contentsettings : {}; 
    return contentSettings }


  get storage() { return this.app.util.storage; }

  get proxy() { return this.app.proxy; }

  get logger() { return this.app.logger; }

  // get contentSettings() { return this.app.contentsettings; }

  get chromeSettings() { return this.app.chromesettings; }

  get regionlist() { return this.app.util.regionlist; }

  get adapter() { return this.app.adapter; }


  /* Transformations */

  get apiSettings() {
    return [...Object.values(this.contentSettings), ...Object.values(this.chromeSettings)];
  }

  get allSettings() { return [...this.appDefaults, ...this.apiSettings]; }

  get appIDs() { return this.appDefaults.map((setting) => { return setting.settingID; }); }

  get apiIDs() { return this.apiSettings.map((setting) => { return setting.settingID; }); }

  get settingIDs() { return this.allSettings.map((setting) => { return setting.settingID; }); }

  getInternalApiSetting(settingID) {
    return this.apiSettings.find((setting) => { return setting.settingID === settingID; });
  }

  existsApplicationSetting(settingID) {
    return Boolean(this.appDefaults.find((setting) => { return setting.settingID === settingID; }));
  }

  validID(settingID) {
    if (!this.settingIDs.includes(settingID)) {
      debug(`invalid settingID: ${settingID}`);
      return false;
    }

    return true;
  }

  toggleSetting(settingID) {
    const newValue = !this.getItem(settingID);
    this.setItem(settingID, newValue);
    return newValue;
  }

  /**
   * Toggle application setting (side effects handled here)
   *
   * @param {string} settingID id of setting
   *
   * @returns {boolean} new value of setting
   */
  toggleApplicationSetting(settingID) {
    const newValue = this.toggleSetting(settingID);

    switch (settingID) {
      case ApplicationIDs.MACE_PROTECTION:
        if (this.app.proxy.enabled()) {
          this.app.proxy.enable().catch(reportError('settings.js'));
        }
        break;

      case ApplicationIDs.DEBUG_MODE:
        if (!newValue) {
          this.logger.removeEntries();
        }
        break;
      default:
        break;
    }
    return newValue;
  }

  /**
   * Toggle API Setting (side effects handled by setting)
   *
   * @param {ApiSetting} setting Api Setting to toggle
   *
   * @returns {Promise<boolean>} new value of setting;
   */
  async toggleApiSetting(setting) {
    const toggle = setting.isApplied() ? setting.clearSetting : setting.applySetting;
    
    try {
      await toggle.call(setting);
    }
    catch (_) {
      debug(`failed to toggle setting: ${setting.settingID}`);
    }
    const newValue = setting.isApplied();
    this.setItem(setting.settingID, newValue);

    return newValue;
  }

  enabled() {
    const { app: { util: { user } } } = this;
    return user.getLoggedIn();
  }

  /**
   * Initialize the setting values
   *
   * @returns {void}
   */
  init() {
    this.allSettings.forEach((setting) => {
      if (!this.hasItem(setting.settingID)) {
        this.setItem(setting.settingID, setting.settingDefault, true);
      }
    });
  }

  /**
   * Toggle the specified setting
   *
   * @param {string} settingID ID for setting
   *
   * @returns {Promise<boolean>} New value of setting
   *
   * @throws {Error} if settingID is not valid
   */
  async toggle(settingID, bridged) {
    if (!bridged && typeof browser != 'undefined') {
      this.adapter.sendMessage('util.settings.toggle', { settingID });
    }
    // Look for setting in application settings
    if (this.existsApplicationSetting(settingID)) {
      return this.toggleApplicationSetting(settingID);
    }

    const apiSetting = this.getInternalApiSetting(settingID);
    if (apiSetting) {
      return this.toggleApiSetting(apiSetting);
    }

    // No such setting
    throw new Error(`settings.js: no such setting: ${settingID}`);
  }

  /**
   * Determine whether the setting exists yet
   *
   * @param {string} settingID ID for setting
   *
   * @returns {boolean} whether setting exists in storage
   *
   * @throws {Error} if settingID is not valid
   */
  hasItem(settingID) {
    if (this.validID(settingID)) {
      return this.storage.hasItem(`settings:${settingID}`);
    }

    throw new Error('settings.js: cannot perform hasItem without valid settingID');
  }

  /**
   * Get the specified setting value
   *
   * @param {string} settingID ID for setting
   *
   * @returns {boolean} value of setting
   *
   * @throws {Error} if settingID is not valid
   */
  getItem(settingID, defaultValue = null) {
    if (this.validID(settingID)) {
      const value = this.storage.getItem(`settings:${settingID}`);
     if (value === null) { return defaultValue; }

      return typeof browser == 'undefined' ? !!this.storage.getItem(`settings:${settingID}`): value === String(true);
    }

    throw new Error('settings.js: cannot perform get without valid settingID');
  }

  /**
   * Check if specified setting is active
   *
   * @param {string} settingID
   */
  isActive(settingID) {
   
      if (this.validID(settingID)) {
        const loggedIn = this.app.util.user.getLoggedIn();
        if (!loggedIn) { return false; }
        const value = this.getItem(settingID);
        if (!value) { return false; }
        const alwaysActive = this.getItem('alwaysActive');
        if (alwaysActive) { return value; }
        const proxyValue = this.app.proxy.getEnabled();
        return (proxyValue && value);
      }
      throw new Error('settings.js: cannot perform isActive without valid settingID');
   
  }

  /**
   * Set the value of specified setting
   *
   * @param {string} settingID ID of setting
   * @param {boolean} value new value for setting
   *  
   * @throws {Error} if settingID is not valid
   *
   * @returns {void}
   */
  setItem(settingID, value, bridged) {
    if (this.validID(settingID)) {
      const newValue = String(value) === 'true';
      const key = `settings:${settingID}`;
      this.storage.setItem(key, newValue);
      if (!bridged && typeof browser != 'undefined') {
        this.adapter.sendMessage('updateSettings', { settingID, value: newValue });
      }
    }
    else {
      throw new Error('cannot perform setItem with invalid settingID');
    }
  }

  getAll() {
    return this.settingIDs.map((settingID) => {
      return {
        settingID,
        value: this.getItem(settingID),
      };
    });
  }


  getAvailable(settingID) {
    if (this.validID(settingID)) {
      if (Object.values(ApplicationIDs).includes(settingID)) {
        return true;
      }
      if (this.apiIDs.includes(settingID)) {
        const setting = this.getApiSetting(settingID);
        if (typeof setting.isAvailable === 'function') {
          return setting.isAvailable();
        }
        return true;
      }
      return true;
    }

    throw new Error('settings.js: cannot get available w/o valid settingID');
  }

  /**
   * Determine whether specified setting is controllable by user
   *
   * @param {string} settingID ID for setting
   *
   * @returns {boolean} Whether the setting is controllable by user
   *
   * @throws {Error} if settingID is not valid
   */
  getControllable(settingID) {
    if (this.validID(settingID)) {
      if (this.apiIDs.includes(settingID)) {
        const setting = this.getInternalApiSetting(settingID);
        // Chromesettings have function
        if (typeof setting.isControllable === 'function') {
          return setting.isControllable();
        }
        return true;
      }      // By default controllable is true
      return true;
    }
    throw new Error('settings.js: cannot get controllable without valid settingID');
  }

  /**
   * Get the actual setting for specified API settingID
   *
   * @param {string} settingID ID of setting
   *
   * @returns {ApiSetting} setting corresponding to settingID
   *
   * @throws {Error} if settingID is not valid API setting
   */
  getApiSetting(settingID) {
    if (!this.validID(settingID)) {
      throw new Error('invalid settingID');
    }
    else if (this.apiIDs.includes(settingID)) {
      return this.apiSettings.find((s) => { return s.settingID === settingID; });
    }
    else {
      throw new Error('settings.js: getApiSetting requires settingID for ApiSetting, not AppSetting');
    }
  }

  /**
   * Default values for Application Settings
   *
   * Also used as list of acceptable application settingID's
   */
  static get appDefaults() {
    return [
      {
        settingID: ApplicationIDs.BLOCK_PLUGINS,
        settingDefault: true, /* TODO: unused until a bug in chrome is fixed. */
      },
      {
        settingID: ApplicationIDs.BLOCK_UTM,
        settingDefault: false,
      },
      {
        settingID: ApplicationIDs.BLOCK_FBCLID,
        settingDefault: false,
      },
      {
        settingID: ApplicationIDs.MACE_PROTECTION,
        settingDefault: false,
      },
      {
        settingID: ApplicationIDs.DEBUG_MODE,
        settingDefault: false,
      },
      {
        settingID: ApplicationIDs.REMEMBER_ME,
        settingDefault: true,
      },
      {
        settingID: ApplicationIDs.FIRST_RUN,
        settingDefault: true,
      },
      {
        settingID: ApplicationIDs.DARK_THEME,
        settingDefault: true,
      },
      {
        settingID: ApplicationIDs.HTTPS_UPGRADE,
        settingDefault: false,
      },
      {
        settingID: ApplicationIDs.ALWAYS_ON,
        settingDefault: true,
      }
    ];
  }
}

export default Settings;
