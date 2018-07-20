class Settings {
  constructor (app) {
    this._app = app;

    this.init = this.init.bind(this);
    this.hasItem = this.hasItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
  }

  static get _defaults () {
    return {
      'blockplugins': true, /* TODO: unused until a bug in chrome is fixed. */
      'blockutm': true,
      'maceprotection': true,
      'debugmode': false,
      'rememberme': true,
    };
  }

  init () {
    const getDefaultSettings = (settingsMap) => Object.values(settingsMap).reduce(
      (accum, s) => {
        return Object.assign({}, accum, {
          [s.settingID]: s.settingDefault,
        });
      },
      {}
    );
    const {contentsettings, chromesettings} = this._app;
    const defaultSettings = Object.assign(
      Settings._defaults,
      getDefaultSettings(contentsettings),
      getDefaultSettings(chromesettings)
    );
    Object.keys(defaultSettings).forEach((settingId) => {
      if (!this.hasItem(settingId)) {
        this.setItem(settingId, defaultSettings[settingId]);
      }
    });
  }

  hasItem (key) {
    return this._app.util.storage.hasItem(`settings:${key}`);
  }

  getItem (key) {
    return this._app.util.storage.getItem(`settings:${key}`) === 'true';
  }

  setItem (key, value) {
    this._app.util.storage.setItem(`settings:${key}`, String(value) === 'true');
  }
}

export default Settings;
