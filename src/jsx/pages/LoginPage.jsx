import PropTypes from 'prop-types';
import React, { Component } from 'react';

import listenOnline from '@hoc/listenOnline';
import LoginForm from '@component/LoginForm';
import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';

class LoginPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.i18n = this.app.util.i18n;
    this.settings = this.app.util.settings;

    // bindings
    this.joinURL = this.joinURL.bind(this);
    this.resetURL = this.resetURL.bind(this);
  }

  joinURL() {
    let joinURL = t('JoinURL');
    if (joinURL.slice(-1) !== '/') { joinURL += '/'; }
    return joinURL + this.app.buildinfo.coupon;
  }

  resetURL() {
    return `https://${this.i18n.domainMap.get(this.i18n.locale)}/pages/reset-password`;
  }

  render() {
    const { context: { theme }, online } = this.props;

    return (
      <div id="login-page" className={`row ${theme}`}>
        <CompanyLogo hideLinks={true} />

        <LoginForm />

        <div className="other-options">
          <a
            target="_blank"
            className={`reset ${online ? '' : 'disabled'}`}
            rel="noopener noreferrer"
            href={online ? this.resetURL() : undefined}
          >
            { t('ForgotPassword') }
          </a>

          <a
            target="_blank"
            className={`join ${online ? '' : 'disabled'}`}
            rel="noopener noreferrer"
            href={online ? this.joinURL() : undefined}
          >
            { t('BuyAccount') }
          </a>
        </div>
      </div>
    );
  }
}

LoginPage.propTypes = {
  online: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
};

export default withAppContext(listenOnline(LoginPage));
