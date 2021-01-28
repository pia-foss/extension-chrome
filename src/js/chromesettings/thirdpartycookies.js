import ChromeSetting from '@chromesettings/chromesetting';

class ThirdPartyCookies extends ChromeSetting {
  constructor() {
    super(chrome.privacy.websites.thirdPartyCookiesAllowed);

    // bindings
    this.onChange = this.onChange.bind(this);

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'thirdpartycookies',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'thirdpartycookies',
      'unblock',
    );

    // init
    this.settingID = 'blockthirdpartycookies';
    this.settingDefault = false;
  }

  // eslint-disable-next-line class-methods-use-this
  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default ThirdPartyCookies;
