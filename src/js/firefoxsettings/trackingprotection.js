import ChromeSetting from '@firefoxsettings/chromesetting';

class TrackingProtection extends ChromeSetting {
  constructor() {
    super(TrackingProtection.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      'always',
      'trackingprotection',
      'block',
    );

    // bindings
    this.clearSetting = this.clearSetting.bind(this);
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.available = Boolean(this.setting);
    this.settingID = 'trackingprotection';
  }

  async clearSetting() {
    try {
      await this.set({ value: false }, { applyValue: true });
      ChromeSetting.debug('trackingprotection', 'unblock ok');
    }
    catch (err) {
      ChromeSetting.debug('trackingprotection', 'unblock failed', err);
    }

    return this;
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === 'always');
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.websites) {
      return chrome.privacy.websites.trackingProtectionMode;
    }
    return undefined;
  }
}

export default TrackingProtection;
