import PropType from 'prop-types';
import React, { Component } from 'react';
import Checkbox from '../checkbox';
import ErrorBoundary from '../../hoc/errorboundary';

class PopularRule extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    const { defaultName } = props;
    this.defaultName = defaultName;
    this.bypasslist = this.app.util.bypasslist;
    this.region = this.app.util.regionlist.getSelectedRegion();
    this.state = { checked: this.bypasslist.isRuleEnabled(defaultName) };

    // Bindings
    this.onChange = this.onChange.bind(this);
  }

  onChange({ target: { checked } }) {
    if (checked) { this.bypasslist.enablePopularRule(this.defaultName); }
    else { this.bypasslist.disablePopularRule(this.defaultName); }
    this.setState({ checked: this.bypasslist.isRuleEnabled(this.defaultName) });
  }

  render() {
    const { checked } = this.state;
    return (
      <li className="list-group-item col-xs-4 popular-rule">
        <label
          htmlFor={this.defaultName}
          className="noselect col-xs-8 popular-rule-name"
        >
          { this.defaultName }
        </label>

        <Checkbox
          id={this.defaultName}
          className="col-xs-2"
          checked={checked}
          disabled={!this.region}
          onChange={this.onChange}
        />
      </li>
    );
  }
}

PopularRule.propTypes = {
  defaultName: PropType.string.isRequired,
};

export default PopularRule;
