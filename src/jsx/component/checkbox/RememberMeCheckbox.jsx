import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tooltip from '@component/Tooltip';
import withAppContext from '@hoc/withAppContext';
import UncontrolledCheckbox from '@component/checkbox/UncontrolledCheckbox';

/**
 * Checkbox to toggle where user credentials are stored (memory/localStorage)
 *
 * Only one of these should exist on the view at a time
 */
class RememberMeCheckbox extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
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
    const { context: { theme }, labelLocaleKey } = this.props;

    return (
      <div className="remember-me-container">
        <UncontrolledCheckbox
          id="remember-checkbox"
          className="popover-trigger"
          onChange={this.onChange}
          defaultChecked={this.rememberMe}
        />

        <label
          htmlFor="remember-checkbox"
          className="checkbox-label popover-trigger"
        >
          { t(labelLocaleKey) }
        </label>

        <Tooltip
          theme={theme}
          orientation="right"
          message={t('RememberMeTooltip')}
        />
      </div>
    );
  }
}

RememberMeCheckbox.propTypes = {
  context: PropTypes.object.isRequired,
  labelLocaleKey: PropTypes.string.isRequired,
};

export default withAppContext(RememberMeCheckbox);
