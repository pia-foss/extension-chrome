function clear(csettings) {
  Object.values(csettings)
    .filter((s) => { return s.isAvailable ? s.isAvailable() : true; })
    .filter((s) => { return !s.alwaysActive; })
    .forEach((s) => { s.clearSetting(); });
}

function apply(csettings, settings) {
  Object.values(csettings)
    .filter((s) => { return s.isAvailable ? s.isAvailable() : true; })
    .filter((s) => { return settings.getItem(s.settingID); })
    .forEach((s) => { s.applySetting(); });
}

class SettingsMananger {
  constructor(app) {
    this.app = app;

    this.enable = this.enable.bind(this);
    this.reapply = this.reapply.bind(this);
    this.disable = this.disable.bind(this);
  }

  enable() {
    const {
      app: {
        util: { settings },
        chromesettings,
        contentsettings,
      },
    } = this;
    apply(contentsettings, settings);
    apply(chromesettings, settings);
  }

  clearAndReapplySettings(){
    const { app: { util:{settings},proxy }} = this;
    const alwaysActive = settings.getItem('alwaysActive');
    const proxyValue = proxy.enabled() == 'fixed_servers' || proxy.enabled() == 'pac_script' ? true : false
    const boolArray = [alwaysActive,proxyValue]
    boolArray.includes(true) ? this.enable() : this.disable();
  }

  /*
     The purpose of this function is to deal with a Chrome bug where when one content setting
     is cleared, all other content settings are also cleared! (eg camera.clear() will clear
     microphone too). The property `microphone.isApplied()` will still be true but
     `camera.isApplied()` won't, so it can be used to determine if the setting should be
     reapplied again or not.

     Link to Chrome Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=700404#c18
     This issue has been fixed in Chrome on Sept 21 2018.
     Will keep this method around until at lesat 5 versions have passed.
     Current Chrome Version: Version 69.0.3497.100 (Official Build) (64-bit)

     After 5 versions have passed, add conditional code to only run the reapply method if the
     version detected is older than Chrome version 71 (assume fix lands in that build).
  */
 
  reapply(contentsettings) {
    const { app: { util: { settings } } } = this;
    const enabled = settings.enabled();
    Object.values(contentsettings)
      .filter((s) => { return s.isAvailable ? s.isAvailable() : true; })
      .filter((s) => { return s.isApplied(); })
      .filter((s) => { return enabled || s.alwaysActive; })
      .forEach((s) => { s.applySetting(); });
  }

  disable() {
    const { app: { contentsettings, chromesettings }} = this;
    clear(chromesettings);
    clear(contentsettings);
    this.reapply(contentsettings);
  }
}

export default SettingsMananger;
