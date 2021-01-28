import ChromeSetting from '@chromesettings/chromesetting';

class AutoFillCreditCard extends ChromeSetting {
  constructor(storage) {
    super(chrome.privacy.services.autofillCreditCardEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'autofillcreditcard',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'autofillcreditcard',
      'unblock',
    );

    // init
    this.settingID = 'blockautofillcreditcard';
    if (storage.getItem('settings:blockautofill')) {
      this.settingDefault = false;
    }
    else {
      this.settingDefault = false;
    }
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default AutoFillCreditCard;
