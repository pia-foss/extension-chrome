import ChromeSetting from '@firefoxsettings/chromesetting';

class NetworkPredication extends ChromeSetting {
  constructor() {
    super(NetworkPredication.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      false,
      'networkprediction',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'networkprediction',
      'unblock',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = false;
    this.available = Boolean(this.setting);
    this.settingID = 'blocknetworkprediction';
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }

  static getSetting() {
    if (chrome.privacy && chrome.privacy.network) {
      return chrome.privacy.network.networkPredictionEnabled;
    }
    return undefined;
  }
}

export default NetworkPredication;
