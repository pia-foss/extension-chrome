import ChromeSetting from '@chromesettings/chromesetting';

class AutoFill extends ChromeSetting {
  constructor() {
    super(chrome.privacy.services.autofillEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'autofill',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'autofill',
      'unblock',
    );

    // init
    this.settingID = 'blockautofill';
    this.settingDefault = false;
  }

  // eslint-disable-next-line class-methods-use-this
  isAvailable() {
    return (
      !chrome.privacy.services.autofillAddressEnabled
      && !chrome.privacy.services.autofillCreditCardEnabled
    );
  }

  // eslint-disable-next-line class-methods-use-this
  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default AutoFill;
