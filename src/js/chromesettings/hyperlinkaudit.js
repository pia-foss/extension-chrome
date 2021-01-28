import ChromeSetting from '@chromesettings/chromesetting';

class HyperLinkAudit extends ChromeSetting {
  constructor() {
    super(chrome.privacy.websites.hyperlinkAuditingEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'hyperlinkaudit',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'hyperlinkaudit',
      'unblock',
    );

    // init
    this.settingID = 'blockhyperlinkaudit';
    this.settingDefault = false;
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default HyperLinkAudit;
