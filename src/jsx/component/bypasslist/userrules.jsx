import React, {Component} from 'react';
import PropType from 'prop-types';

import BypassItem from 'component/bypasslist/bypassitem';

class UserRules extends Component {
  constructor (props) {
    super(props);

    // properties
    this._bypasslist = props.app.util.bypasslist;
    this.state = {
      userInput: '',
      userRules: this._bypasslist.getUserRules()
    };

    // bindings
    this.save = this.save.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.createRemoveRule = this.createRemoveRule.bind(this);
    this.createBypassItem = this.createBypassItem.bind(this);
    this.onUserInputChange = this.onUserInputChange.bind(this);
  }

  onKeyPress (e) {
    if (e.key === 'Enter') { return this.save(); }
  }

  onUserInputChange (e) {
    this.setState({ userInput: e.currentTarget.value });
  }

  save () {
    const newUserRule = this.state.userInput;
    this._bypasslist.addUserRule(newUserRule);
    this._bypasslist.restartProxy();
    this.setState({
      userInput: '',
      userRules: this._bypasslist.getUserRules()
    });
  }

  createRemoveRule (rule) {
    return (ev) => {
      this._bypasslist.removeUserRule(rule);
      this._bypasslist.restartProxy();
      this.setState({ userRules: this._bypasslist.getUserRules() });
    };
  }

  createBypassItem (rule) {
    return <BypassItem rule={rule} key={rule} onRemoveItem={this.createRemoveRule(rule)} />;
  }

  render () {
    return (
      <div className="user-rules">
        <h3 className="bl_sectionheader instructions">
          { t("OtherWebsites") }
        </h3>

        <div className="introtext">
          <span className="bold">
            { t('BypassInstructionsBold') }
          </span> { t('BypassInstructions') }
        </div>

        <div className="add-container">
          <input
            type="text"
            name="rule"
            className="add-rule-input"
            placeholder="*.privateinternetaccess.com"
            value={this.state.userInput}
            onKeyPress={this.onKeyPress}
            onChange={this.onUserInputChange}
          />
          <button className="add-rule-btn" onClick={this.save}>
            <p>+</p>
          </button>
        </div>

        <div className="otherlist">
          { this.state.userRules.map(this.createBypassItem) }
        </div>
      </div>
    );
  }
}

UserRules.propType = {
  app: PropType.object.isRequired,
};

export default UserRules;
