import ChromeSetting from '@firefoxsettings/chromesetting';

class ThirdPartyCookies extends ChromeSetting {
  constructor() {
    super(ThirdPartyCookies.getSetting());

    // functions
    this.applySetting(
      false,
      'thirdpartycookies',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'thirdpartycookies',
      'block',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.available = Boolean(this.setting);
    this.settingID = 'blockthirdpartycookies';
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.websites) {
      return chrome.privacy.websites.thirdPartyCookiesAllowed;
    }
    return undefined;
  }
}

export default ThirdPartyCookies;
