import ChromeSetting from '@firefoxsettings/chromesetting';

class HyperLinkAudit extends ChromeSetting {
  constructor() {
    super(HyperLinkAudit.getSetting());

    // function
    this.applySetting = this.createApplySetting(
      false,
      'hyperlinkaudit',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'hyperlinkaudit',
      'unblock',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.available = Boolean(this.setting);
    this.settingID = 'blockhyperlinkaudit';
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.websites) {
      return chrome.privacy.websites.hyperlinkAuditingEnabled;
    }
    return undefined;
  }
}

export default HyperLinkAudit;
