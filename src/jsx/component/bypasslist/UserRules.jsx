import React, { Component } from 'react';
import BypassItem from './BypassItem';

class UserRules extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.bypasslist = this.app.util.bypasslist;
    this.region = this.app.util.regionlist.getSelectedRegion();
    this.state = {
      userInput: '',
      userRules: this.bypasslist.getUserRules(),
    };

    // bindings
    this.save = this.save.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.createRemoveRule = this.createRemoveRule.bind(this);
    this.createBypassItem = this.createBypassItem.bind(this);
    this.onUserInputChange = this.onUserInputChange.bind(this);
  }

  onKeyPress(e) {
    if (e.key === 'Enter') { return this.save(); }
    return undefined;
  }

  onUserInputChange(e) {
    this.setState({ userInput: e.currentTarget.value });
  }

  save() {
    const { userInput } = this.state;
    this.bypasslist.addUserRule(userInput);
    this.bypasslist.restartProxy();
    this.setState({
      userInput: '',
      userRules: this.bypasslist.getUserRules(),
    });
  }

  createRemoveRule(rule) {
    return () => {
      if (!this.region) { return; }
      this.bypasslist.removeUserRule(rule);
      this.bypasslist.restartProxy();
      this.setState({ userRules: this.bypasslist.getUserRules() });
    };
  }

  createBypassItem(rule) {
    return <BypassItem rule={rule} key={rule} onRemoveItem={this.createRemoveRule(rule)} />;
  }

  render() {
    const { userInput, userRules } = this.state;

    return (
      <div className="user-rules">
        <h3 className="bl_sectionheader instructions">
          { t('OtherWebsites') }
        </h3>

        <div className="introtext">
          <span className="bold">
            { t('BypassInstructionsBold') }
          </span>

          &nbsp;

          { t('BypassInstructions') }
        </div>

        <div className="add-container">
          <input
            type="text"
            name="rule"
            className="add-rule-input"
            placeholder="*.privateinternetaccess.com"
            value={userInput}
            disabled={!this.region}
            onKeyPress={this.onKeyPress}
            onChange={this.onUserInputChange}
          />

          <button
            type="button"
            className="add-rule-btn"
            disabled={!this.region}
            onClick={this.save}
          >
            <p>
              +
            </p>
          </button>
        </div>

        <div className={`rule-list ${!this.region ? 'disabled' : ''}`}>
          { userRules.map(this.createBypassItem) }
        </div>
      </div>
    );
  }
}

export default UserRules;
