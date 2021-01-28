import ChromeSetting from '@chromesettings/chromesetting';

class WebRTCSetting extends ChromeSetting {
  constructor() {
    super(chrome.privacy.network.webRTCIPHandlingPolicy);

    // bindings
    this.init = this.init.bind(this);
    this.onChange = this.onChange.bind(this);

    // functions
    this.applySetting = this.createApplySetting(
      'disable_non_proxied_udp',
      'webrtc',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'webrtc',
      'unblock',
    );

    // init
    this.settingID = 'preventwebrtcleak';
    this.settingDefault = false;
  }

  init() {
    this.blockable = chrome.privacy.network.webRTCIPHandlingPolicy !== undefined;
    super.init();
  }

  onChange(details) {
    this.levelOfControl = details.levelOfControl;
    this.blocked = (details.value === 'disable_non_proxied_udp');
  }
}

export default WebRTCSetting;
