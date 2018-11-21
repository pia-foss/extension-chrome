import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LoginForm from '../component/LoginForm';
import CompanyLogo from '../component/CompanyLogo';
import OfflineWarning from '../component/OfflineWarning';
import listenOnline from 'hoc/listenOnline';

export default function () {
  class LoginTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.app = background.app;

      // bindings
      this.joinURL = this.joinURL.bind(this);
    }

    joinURL() {
      let joinURL = t('JoinURL');
      if (joinURL.slice(-1) !== '/') { joinURL += '/'; }
      return joinURL + this.app.buildinfo.coupon;
    }

    render() {
      const { props: { online } } = this;

      return (
        <div id="login-template" className="row">
          <OfflineWarning />

          <CompanyLogo />

          <div className="top-border">
            <LoginForm />
          </div>

          <div className="top-border">
            <div className="text-center dont-have-an-account">
              { t('NoAccountQuestion') }
            </div>

            <div className="join-PIA">
              <div className="col-xs-1" />
              <a
                className={[
                  'col-xs-10',
                  'btn-info',
                  'btn-signup',
                  /* only disable if offline */
                  ...(online ? [] : ['disabled']),
                ].join(' ')}
                target="_blank"
                rel="noopener noreferrer"
                // only render href if online
                href={online ? this.joinURL() : undefined}
              >
                { t('JoinText') }
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  LoginTemplate.propTypes = {
    online: PropTypes.bool.isRequired,
  };

  return listenOnline(LoginTemplate);
}
