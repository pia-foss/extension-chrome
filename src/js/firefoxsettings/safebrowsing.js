import ChromeSetting from '@firefoxsettings/chromesetting';

class SafeBrowsing extends ChromeSetting {
  constructor() {
    super(SafeBrowsing.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'safebrowsing',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'safebrowsing',
      'unblock',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.available = Boolean(this.setting);
    this.settingID = 'blocksafebrowsing';
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.services) {
      return chrome.privacy.services.safeBrowsingEnabled;
    }
    return undefined;
  }
}

export default SafeBrowsing;
