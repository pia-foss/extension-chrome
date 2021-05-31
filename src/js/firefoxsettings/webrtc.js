import ChromeSetting from '@firefoxsettings/chromesetting';

class WebRTC extends ChromeSetting {
  constructor() {
    super(WebRTC.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      'proxy_only',
      'webrtc',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'webrtc',
      'unblock',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.blockable = Boolean(this.setting);
    this.settingID = 'preventwebrtcleak';
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === 'proxy_only');
  }

  static getSetting() {
    if (
      chrome.privacy
      && chrome.privacy.network
    ) {
      return chrome.privacy.network.webRTCIPHandlingPolicy;
    }
    return undefined;
  }
}

export default WebRTC;
