import ChromeSetting from '@chromesettings/chromesetting';

class HttpReferer extends ChromeSetting {
  constructor() {
    super(chrome.privacy.websites.referrersEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

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

    // init
    this.settingID = 'blockreferer';
    this.settingDefault = false;
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default HttpReferer;
