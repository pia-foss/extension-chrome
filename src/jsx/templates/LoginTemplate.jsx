import React, { Component } from 'react';
import LoginForm from '../component/LoginForm';
import CompanyLogo from '../component/CompanyLogo';
import OfflineWarning from '../component/OfflineWarning';

export default function () {
  return class LoginTemplate extends Component {
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
                className="col-xs-10 btn-info btn-signup"
                target="_blank"
                rel="noopener noreferrer"
                href={this.joinURL()}
              >
                { t('JoinText') }
              </a>
            </div>
          </div>
        </div>
      );
    }
  };
}
