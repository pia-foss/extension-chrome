import ChromeSetting from '@chromesettings/chromesetting';

class SafeBrowsing extends ChromeSetting {
  constructor() {
    super(chrome.privacy.services.safeBrowsingEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

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

    // init
    this.settingID = 'blocksafebrowsing';
    this.settingDefault = false;
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default SafeBrowsing;
