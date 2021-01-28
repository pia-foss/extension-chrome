import ChromeSetting from '@chromesettings/chromesetting';

class NetworkPrediction extends ChromeSetting {
  constructor() {
    super(chrome.privacy.network.networkPredictionEnabled);

    // bindings
    this.onChange = this.onChange.bind(this);

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

    // init
    this.settingID = 'blocknetworkprediction';
    this.settingDefault = false;
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === false);
  }
}

export default NetworkPrediction;
