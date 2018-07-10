import React, {Component} from 'react';
import PropType from 'prop-types';

import BypassItem from 'component/bypasslist/bypassitem';

class UserRules extends Component {
  constructor (props) {
    super(props);

    this._bypasslist = props.app.util.bypasslist;
    this.save = this.save.bind(this);
    this.createRemoveRule = this.createRemoveRule.bind(this);
    this.createBypassItem = this.createBypassItem.bind(this);
    this.onUserInputChange = this.onUserInputChange.bind(this);

    this.state = {
      userRules: this._bypasslist.getUserRules(),
      userInput: '',
    };
  }

  onUserInputChange (ev) {
    const userInput = ev.currentTarget.value;
    this.setState(() => ({
      userInput,
    }));
  }

  save () {
    const newUserRule = this.state.userInput;
    this._bypasslist.addUserRule(newUserRule);
    this._bypasslist.restartProxy();
    this.setState(() => ({
      userRules: this._bypasslist.getUserRules(),
      userInput: '',
    }));
  }

  createRemoveRule (rule) {
    return (ev) => {
      this._bypasslist.removeUserRule(rule);
      this._bypasslist.restartProxy();
      this.setState(() => ({
        userRules: this._bypasslist.getUserRules(),
      }));
    };
  }

  createBypassItem (rule) {
    return <BypassItem rule={rule} key={rule} onRemoveItem={this.createRemoveRule(rule)} />;
  }

  render () {
    return (
      <div className="user-rules">
        <h3 className="bl_sectionheader">{t("OtherWebsites")}</h3>
        <div className="add-container">
          <input
            type="text"
            name="rule"
            id="user-rules-add-bar"
            className="add-bar"
            onChange={this.onUserInputChange}
            value={this.state.userInput}
          />
          <button className="add-btn" onClick={this.save}>
            <p>+</p>
          </button>
        </div>
        <div className="otherlist">
          {this.state.userRules.map(this.createBypassItem)}
        </div>
      </div>
    );
  }
}

UserRules.propType = {
  app: PropType.object.isRequired,
};

export default UserRules;
