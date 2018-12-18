/*
   This object wraps a ChromeSetting: https://developer.chrome.com/extensions/types#type-ChromeSetting
   Similar to but not the same as a ContentSetting.
*/
class ChromeSetting {
  static get defaultSetOptions() { return { scope: 'regular' }; }

  static get defaultGetOptions() { return {}; }

  static get defaultClearOptions() { return { scope: 'regular' }; }

  static get controlled() { return 'controlled_by_this_extension'; }

  static get controllable() { return 'controllable_by_this_extension'; }

  static get notControllable() { return 'not_controllable'; }

  constructor(setting) {
    // bindings
    this.init = this.init.bind(this);
    this.getLevelOfControl = this.getLevelOfControl.bind(this);
    this.isControllable = this.isControllable.bind(this);
    this.isBlocked = this.isBlocked.bind(this);
    this.isApplied = this.isApplied.bind(this);
    this.onChange = this.onChange.bind(this);
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.clear = this.clear.bind(this);
    this.createApplySetting = this.createApplySetting.bind(this);
    this.createClearSetting = this.createClearSetting.bind(this);

    // init
    this.setting = setting;
    this.levelOfControl = undefined;
    this.blocked = undefined;
    this.applied = undefined;
  }

  async init() {
    if (this.isAvailable()) {
      this.setting.onChange.addListener(this.onChange);
      await this.setting.get({}, this.onChange);
    }
    else {
      this.setLevelOfControl(ChromeSetting.notControllable);
      this.blocked = true;
    }
  }

  isAvailable() {
    return !!this.setting;
  }

  // eslint-disable-next-line class-methods-use-this
  onChange() {
    throw new Error('each chromesetting must implement it\'s own onChange listener');
  }

  /**
   * Get the current level of control
   *
   * @returns {string} current level of control
   */
  getLevelOfControl() {
    return this.levelOfControl;
  }

  setLevelOfControl(levelOfControl) {
    this.levelOfControl = levelOfControl;
  }

  /**
   * Determine whether the setting is controllable
   *
   * @returns {boolean} whether setting is controllable
   */
  isControllable() {
    return (
      this.levelOfControl === undefined
      || this.levelOfControl === ChromeSetting.controlled
      || this.levelOfControl === ChromeSetting.controllable
    );
  }

  /**
   * Determine whether or not the setting is blocked
   *
   * @returns {boolean} whether setting is blocked
   */
  isBlocked() {
    return this.blocked;
  }

  setBlocked(blocked) {
    this.blocked = blocked;
  }

  /**
   * Determine whether or not setting is applied
   *
   * @returns {boolean} whether setting is applied
   */
  isApplied() {
    return this.applied;
  }

  /**
   * Set the info for the setting
   */
  set(options) {
    return new Promise((resolve, reject) => {
      if (this.isControllable()) {
        this.setting.set(
          Object.assign({}, ChromeSetting.defaultSetOptions, options),
          () => {
            if (chrome.runtime.lastError === undefined) {
              this.applied = true;
              resolve();
            }
            else {
              reject(chrome.runtime.lastError);
            }
          },
        );
      }
      else {
        reject(new Error('extension cannot control this setting'));
      }
    });
  }

  /**
   * Get the current info for setting
   */
  get() {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject();
        return;
      }
      this.setting.get(
        ChromeSetting.defaultGetOptions,
        async (details) => {
          await this.onChange(details);
          if (chrome.runtime.lastError === undefined) {
            resolve(details);
          }
          else {
            reject(chrome.runtime.lastError);
          }
        },
      );
    });
  }

  /**
   * Clear the info for the setting
   */
  clear(options) {
    return new Promise((resolve, reject) => {
      if (this.isControllable()) {
        this.setting.clear(
          Object.assign({}, ChromeSetting.defaultClearOptions, options || {}),
          () => {
            if (chrome.runtime.lastError === undefined) {
              this.applied = false;
              resolve();
            }
            else {
              reject(chrome.runtime.lastError);
            }
          },
        );
      }
      else {
        reject(new Error('extension cannot control this setting'));
      }
    });
  }

  createApplySetting(value, name, action) {
    return (async function applySetting() {
      try {
        await this.set({ value });
        ChromeSetting.debug(name, `${action} ok`);
      }
      catch (err) {
        ChromeSetting.debug(name, `${action} failed`);
      }

      return this;
    }).bind(this);
  }

  createClearSetting(name, action) {
    return (async function clearSetting() {
      try {
        await this.clear();
        ChromeSetting.debug(name, `${action} ok`);
      }
      catch (err) {
        ChromeSetting.debug(name, `${action} failed`);
      }

      return this;
    }).bind(this);
  }

  static debug(name, msg, err) {
    const debugMsg = `${name}.js: ${msg}`;
    debug(debugMsg);
    if (err) {
      const errMsg = `error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`;
      debug(errMsg);
    }
    return new Error(debugMsg);
  }
}

export default ChromeSetting;
