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
  MACE_PROTECTION: 'maceprotection',
  DEBUG_MODE: 'debugmode',
  REMEMBER_ME: 'rememberme',
  LOGOUT_ON_CLOSE: 'logoutOnClose',
};

class Settings {
  constructor (app) {
    this._app = app;

    // Bindings
    this.init = this.init.bind(this);
    this.hasItem = this.hasItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getControllable = this.getControllable.bind(this);
  }

  /* App Getters */
  get _storage () { return this._app.util.storage; }
  get _proxy () { return this._app.proxy; }
  get _logger () { return this._app.logger; }
  get _contentSettings () { return this._app.contentsettings; }
  get _chromeSettings () { return this._app.chromesettings; }
  get _regionlist () { return this._app.util.regionlist; }

  /* Transformations */
  get _apiSettings () { return [...Object.values(this._contentSettings), ...Object.values(this._chromeSettings)]; }
  get _allSettings () { return [...Settings._appDefaults, ...this._apiSettings]; }
  get _appIDs () { return Settings._appDefaults.map((setting) => setting.settingID); }
  get _apiIDs () { return this._apiSettings.map((setting) => setting.settingID); }
  get _allIDs () { return this._allSettings.map((setting) => setting.settingID); }

  _getApiSetting (settingID) {
    return this._apiSettings
      .find((setting) => setting.settingID === settingID);
  }

  _existsApplicationSetting (settingID) {
    return Boolean(Settings._appDefaults.find((setting) => setting.settingID === settingID));
  }

  _validID (settingID) {
    if (!this._allIDs.includes(settingID)) {
      console.error(debug(`invalid settingID: ${settingID}`));
      return false;
    }

    return true;
  }

  _toggleSetting (settingID) {
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
  _toggleApplicationSetting (settingID) {
    const newValue = this._toggleSetting(settingID);

    switch (settingID) {
      case ApplicationIDs.MACE_PROTECTION:
        if (this._proxy.enabled()) {
          this._proxy.enable().catch(console.error);
        }
        break;

      case ApplicationIDs.DEBUG_MODE:
        if (!newValue) {
          this._logger.removeEntries();
        }
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
  async _toggleApiSetting (setting) {
    const toggle = setting.isApplied() ? setting.clearSetting : setting.applySetting;
    try {
      await toggle.call(setting);
    }
    catch (_) {
      console.error(debug(`failed to toggle setting: ${setting.settingID}`));
    }
    const newValue = setting.isApplied();
    this.setItem(setting.settingID, newValue);

    return newValue;
  }

  /**
   * Initialize the setting values
   *
   * @returns {void}
   */
  init () {
    this._allSettings.forEach((setting) => {
      if (!this.hasItem(setting.settingID)) {
        this.setItem(setting.settingID, setting.settingDefault);
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
  async toggle (settingID) {
    // Look for setting in application settings
    if (this._existsApplicationSetting(settingID)) {
      return this._toggleApplicationSetting(settingID);
    }

    const apiSetting = this._getApiSetting(settingID);
    if (apiSetting && (apiSetting.alwaysActive || this._proxy.enabled())) {
      return this._toggleApiSetting(apiSetting);
    }

    if (apiSetting) {
      return this._toggleSetting(settingID);
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
  hasItem (settingID) {
    if (this._validID(settingID)) {
      return this._storage.hasItem(`settings:${settingID}`);
    }
    else {
      throw new Error('settings.js: cannot perform hasItem without valid settingID');
    }
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
  getItem (settingID) {
    if (this._validID(settingID)) {
      return this._storage.getItem(`settings:${settingID}`) === 'true';
    }
    else {
      throw new Error('settings.js: cannot perform get without valid settingID');
    }
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
  setItem (settingID, value) {
    if (this._validID(settingID)) {
      const newValue = String(value) === 'true';
      this._storage.setItem(`settings:${settingID}`, newValue);
    }
    else {
      throw new Error('settings.js: cannot perform set without valid settingID');
    }
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
  getControllable (settingID) {
    if (this._validID(settingID)) {
      // LogoutOnClose depends on rememberme
      if (settingID === ApplicationIDs.LOGOUT_ON_CLOSE) {
        return this.getItem(ApplicationIDs.REMEMBER_ME);
      }

      else if (this._apiIDs.includes(settingID)) {
        const setting = this._getApiSetting(settingID);
        // Chromesettings have function
        if (typeof setting.isControllable === 'function') {
          return setting.isControllable();
        }
        else {
          return true;
        }
      }
      // By default controllable is true
      else {
        return true;
      }
    }
    else {
      throw new Error('settings.js: cannot get controllable without valid settingID');
    }
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
  getApiSetting (settingID) {
    if (!this._validID(settingID)) {
      throw new Error('invalid settingID');
    }
    else if (this._apiIDs.includes(settingID)) {
      return this._apiSettings.find((s) => s.settingID === settingID);
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
  static get _appDefaults () {
    return [
      {
        settingID: ApplicationIDs.BLOCK_PLUGINS,
        settingDefault: true, /* TODO: unused until a bug in chrome is fixed. */
      },
      {
        settingID: ApplicationIDs.BLOCK_UTM,
        settingDefault: true,
      },
      {
        settingID: ApplicationIDs.MACE_PROTECTION,
        settingDefault: true,
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
        settingID: ApplicationIDs.LOGOUT_ON_CLOSE,
        settingDefault: false,
      },
    ];
  }
}

export default Settings;
