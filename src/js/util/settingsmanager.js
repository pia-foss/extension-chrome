export default function(app) {
  const apply = (csettings, settings) => {
    for(let name in csettings)
      if(settings.getItem(csettings[name].settingID))
        csettings[name].applySetting()
  }
  const clear = (csettings) => {
    for(let name in csettings)
      if(!csettings[name].alwaysActive)
        csettings[name].clearSetting()
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
  this.reapply = (contentsettings) => {
    const connected = app.proxy.enabled()
    for(let name in contentsettings)
      if(contentsettings[name].isApplied() && (connected || contentsettings[name].alwaysActive))
        contentsettings[name].applySetting()
  }

  this.handleConnect = () => {
    const {settings} = app.util,
          {contentsettings, chromesettings} = app
    apply(contentsettings, settings)
    apply(chromesettings, settings)
  }

  this.handleDisconnect = () => {
    const {contentsettings, chromesettings} = app
    clear(chromesettings)
    clear(contentsettings)
    this.reapply(contentsettings)
  }

  return this
}
