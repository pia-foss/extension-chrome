import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LoginField from 'component/LoginField';
import onSubmit from 'eventhandler/templates/login/onSubmit';
import RememberMeCheckbox from 'component/checkbox/RememberMeCheckbox';
import listenOnline from 'hoc/listenOnline';

class LoginForm extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.i18n = this.app.util.i18n;
    this.user = this.app.util.user;

    // bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange({ target: { value, name } }) {
    switch (name) {
      case 'username': {
        this.user.setUsername(value);
        break;
      }

      case 'password': {
        this.user.setPassword(value);
        break;
      }

      default: {
        console.error(`invalid name for login field: ${value}`);
        debug(`invalid name for login field: ${value}`);
      }
    }
  }

  handleSubmit(event) {
    return onSubmit(this.renderer, this.app, event);
  }

  resetPasswordURL() {
    return `https://${this.i18n.domainMap.get(this.i18n.locale)}/pages/reset-password`;
  }

  render() {
    const {
      app: { util: { user } },
      props: { online }
    } = this;

    return (
      <form id="login" onSubmit={this.handleSubmit}>
        <div className="col-xs-1" />

        <div className="col-xs-10">
          <div className="text-danger bottom-gap col-xs-12 hidden" />

          <div className="form-group">
            <LoginField
              autocomplete="off"
              name="username"
              type="text"
              localeKey="UsernamePlaceholder"
              defaultValue={user.getUsername()}
              onChange={this.onInputChange}
              autoFocus={true}
            />
          </div>

          <div className="form-group">
            <LoginField
              autocomplete="off"
              name="password"
              type="password"
              localeKey="PasswordPlaceholder"
              defaultValue={user.getPassword()}
              onChange={this.onInputChange}
            />
          </div>

          <div className="form-group">
            <RememberMeCheckbox labelLocaleKey="RememberMe" />
          </div>

          <div className="form-group text-center">
            <button id="submit-form-button" type="submit" className="btn-success form-control">
              { t('LoginText') }
            </button>

            <div className="resetpw text-center">
              <a
                href={online ? this.resetPasswordURL() : undefined}
                karget="_blank"
                rel="noopener noreferrer"
                className={online ? '' : 'disabled'}
              >
                { t('ResetPasswordText') }
              </a>
            </div>

            <div className="loader login-loader hidden" />
          </div>
        </div>
      </form>
    );
  }
}

LoginForm.propTypes = {
  online: PropTypes.bool.isRequired,
};

export default listenOnline(LoginForm);
