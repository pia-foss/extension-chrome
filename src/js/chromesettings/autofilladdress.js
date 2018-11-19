import ChromeSetting from 'chromesettings/chromesetting';

class AutoFillAddress extends ChromeSetting {
  constructor() {
    super(chrome.privacy.services.autofillAddressEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'autofilladdress',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'autofilladdress',
      'unblock',
    );

    // init
    this.settingID = 'blockautofilladdress';
    // If it exists, use value from old API
    if (localStorage.getItem('settings:blockautofill') === 'false') {
      this.settingDefault = false;
    }
    else {
      this.settingDefault = true;
    }
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default AutoFillAddress;
