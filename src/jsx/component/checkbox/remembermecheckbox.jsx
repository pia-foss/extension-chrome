import React, {Component} from 'react';
import PropTypes from 'prop-types';

import UncontrolledCheckbox from './uncontrolledcheckbox';
import Tooltip from 'component/tooltip';

/**
 * Checkbox to toggle where user credentials are stored (memory/localStorage)
 *
 * Only one of these should exist on the view at a time
 */
class RememberMeCheckbox extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onChange = this.onChange.bind(this);

    // Init
    const {remember, app: {util: {settings}}} = props;
    // TODO: Convert this too
    this.defaultChecked = remember && settings.getItem('rememberme');
  }

  onChange (checked) {
    const {user} = this.props.app.util;
    user.setRememberMe(checked);
  }

  render () {
    return (
      <div className="remember-me-container popover-owner">
        <UncontrolledCheckbox
          defaultChecked={this.defaultChecked}
          onChange={this.onChange}
          id="remember-checkbox"
        />
        <label htmlFor="remember-checkbox">{t(this.props.labelLocaleKey)}</label>
        <Tooltip message={t('RememberMeTooltip')} />
      </div>
    );
  }
}

RememberMeCheckbox.propTypes = {
  remember: PropTypes.bool,
  app: PropTypes.object.isRequired,
  labelLocaleKey: PropTypes.string.isRequired,
};

export default RememberMeCheckbox;
