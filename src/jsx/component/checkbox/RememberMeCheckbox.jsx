import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tooltip from 'component/Tooltip';
import UncontrolledCheckbox from './UncontrolledCheckbox';

/**
 * Checkbox to toggle where user credentials are stored (memory/localStorage)
 *
 * Only one of these should exist on the view at a time
 */
class RememberMeCheckbox extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.user = this.app.util.user;
    this.settings = this.app.util.settings;
    this.rememberMe = this.settings.getItem('rememberme');

    // Bindings
    this.onChange = this.onChange.bind(this);
  }

  onChange(checked) {
    this.user.setRememberMe(checked);
  }

  render() {
    const { labelLocaleKey } = this.props;

    return (
      <div className="remember-me-container popover-owner">
        <UncontrolledCheckbox
          id="remember-checkbox"
          defaultChecked={this.rememberMe}
          onChange={this.onChange}
        />
        <label htmlFor="remember-checkbox">
          { t(labelLocaleKey) }
        </label>
        <Tooltip message={t('RememberMeTooltip')} />
      </div>
    );
  }
}

RememberMeCheckbox.propTypes = {
  labelLocaleKey: PropTypes.string.isRequired,
};

export default RememberMeCheckbox;
