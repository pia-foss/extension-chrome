import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Checkbox from '@component/checkbox';
import ErrorBoundary from '@hoc/errorboundary';
import withAppContext from '@hoc/withAppContext';

class PopularRule extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.defaultName = props.defaultName;
    this.bypasslist = this.app.util.bypasslist;
    this.region = this.app.util.regionlist.getSelectedRegion();
    this.state = { checked: this.bypasslist.isRuleEnabled(this.defaultName) };

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
    const { context: { theme } } = this.props;
    return (
      <li className={`popular-rule ${theme}`}>
        <label
          htmlFor={this.defaultName}
          className="noselect popular-rule-name"
        >
          { this.defaultName }
        </label>

        <Checkbox
          id={this.defaultName}
          theme={theme}
          checked={checked}
          disabled={!this.region}
          onChange={this.onChange}
        />
      </li>
    );
  }
}

PopularRule.propTypes = {
  context: PropTypes.object.isRequired,
  defaultName: PropTypes.string.isRequired,
};

export default ErrorBoundary(withAppContext(PopularRule));
