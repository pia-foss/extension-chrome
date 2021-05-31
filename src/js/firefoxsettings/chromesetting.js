/*
   This object wraps a ChromeSetting: https://developer.chrome.com/extensions/types#type-ChromeSetting
   Similar to but not the same as a ContentSetting.
*/
class ChromeSetting {
  static get controllable() { return 'controllable_by_this_extension'; }

  static get controlled() { return 'controlled_by_this_extension'; }

  static get notControllable() { return 'not_controllable'; }

  static get defaultSetOptions() { return { scope: 'regular' }; }

  static get defaultGetOptions() { return {}; }

  static get defaultClearOptions() { return { scope: 'regular' }; }

  constructor(setting) {
    // init
    this.setting = setting;
  }

  async init() {
    if (this.isAvailable()) {
      // This API is currently missing on Firefox but documented as existing:
      // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/types/BrowserSetting/onChange
      if (this.setting.onChange) {
        this.setting.onChange.addListener(this.onChange);
      }
      await this.get();
    }
    else {
      this.setLevelOfControl(ChromeSetting.notControllable);
      this.setBlocked(true);
    }
  }

  isAvailable() {
    return !!this.setting;
  }

  // eslint-disable-next-line class-methods-use-this
  onChange() {
    throw new Error('Each chromesetting must implement onChange');
  }

  getLevelOfControl() {
    return this.levelOfControl;
  }

  setLevelOfControl(levelOfControl) {
    this.levelOfControl = levelOfControl;
  }

  isControllable() {
    return (
      this.levelOfControl === ChromeSetting.controllable
      || this.levelOfControl === ChromeSetting.controlled
    );
  }

  isBlocked() {
    return this.blocked;
  }

  setBlocked(blocked) {
    this.blocked = blocked;
  }

  isApplied() {
    return this.applied;
  }

  set(options, override) {
    return new Promise((resolve, reject) => {
      if (this.isControllable()) {
        this.setting.set(
          Object.assign({}, ChromeSetting.defaultSetOptions, options),
          () => {
            if (chrome.runtime.lastError === null) {
              if (override && override.applyValue) { this.applied = options.value; }
              else { this.applied = true; }
              resolve();
            }
            else {
              reject(chrome.runtime.lastError);
            }
          },
        );
      }
      else {
        reject(new Error(`${this.settingID}: extension cannot control this setting`));
      }
    });
  }

  get() {
    return new Promise((resolve, reject) => {
      if (this.isAvailable()) {
        this.setting.get(ChromeSetting.defaultGetOptions, async (details) => {
          await Promise.resolve(this.onChange(details));
          if (chrome.runtime.lastError === null) {
            resolve(details);
          }
          else {
            reject(chrome.runtime.lastError);
          }
        });
      }
      else {
        reject(new Error(`${this.settingID} setting is not available`));
      }
    });
  }

  clear(options) {
    return new Promise((resolve, reject) => {
      if (this.isControllable()) {
        this.setting.clear(
          Object.assign({}, ChromeSetting.defaultClearOptions, options),
          () => {
            if (chrome.runtime.lastError === null) {
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
        reject(new Error(`${this.settingID}: extension cannot control this setting`));
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
