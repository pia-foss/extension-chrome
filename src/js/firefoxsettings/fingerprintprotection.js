import ChromeSetting from '@firefoxsettings/chromesetting';

class FingerprintProtection extends ChromeSetting {
  constructor() {
    super(FingerprintProtection.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      true,
      'fingerprintprotection',
      'block',
    );

    // bindings
    this.clearSetting = this.clearSetting.bind(this);
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.available = Boolean(this.setting);
    this.settingID = 'fingerprintprotection';
  }

  async clearSetting() {
    try {
      await this.set({ value: false }, { applyValue: true });
      ChromeSetting.debug('fingerprintprotection', 'unblock ok');
    }
    catch (err) {
      ChromeSetting.debug('fingerprintprotection', 'unblock failed', err);
    }
    return this;
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.websites) {
      return chrome.privacy.websites.resistFingerprinting;
    }
    return undefined;
  }
}

export default FingerprintProtection;
