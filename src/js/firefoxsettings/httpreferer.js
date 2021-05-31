import ChromeSetting from '@firefoxsettings/chromesetting';

class HttpReferrer extends ChromeSetting {
  constructor() {
    super(HttpReferrer.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'httpreferer',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'httpreferer',
      'unblock',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.settingID = 'blockreferer';
    this.referable = Boolean(this.setting);
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.websites) {
      return chrome.privacy.websites.referrersEnabled;
    }

    return undefined;
  }
}

export default HttpReferrer;
