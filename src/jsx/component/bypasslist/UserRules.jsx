import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';
import BypassItem from '@component/bypasslist/BypassItem';

class UserRules extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
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
    const { context: { theme } } = this.props;
    return (
      <BypassItem
        key={rule}
        theme={theme}
        rule={rule}
        onRemoveItem={this.createRemoveRule(rule)}
      />
    );
  }

  render() {
    const { context: { theme } } = this.props;
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

        <div className={`add-container ${theme}`}>
          <input
            type="text"
            name="rule"
            maxLength="32779"
            value={userInput}
            className="add-rule-input"
            placeholder="*.privateinternetaccess.com"
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

        <div className={`rule-list ${!this.region ? 'disabled' : ''} ${theme}`}>
          { userRules.map(this.createBypassItem) }
        </div>
      </div>
    );
  }
}

UserRules.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(UserRules);
