import React, { Component } from 'react';
import Switch from '../component/Switch';
import CompanyLogo from '../component/CompanyLogo';
import SettingsIcon from '../component/SettingsIcon';
import LogoutButton from '../component/LogoutButton';
import CurrentRegion from '../component/CurrentRegion';
import OfflineWarning from '../component/OfflineWarning';
import listenOnline from 'hoc/listenOnline';

export default function () {
  class AuthenticatedTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.app = background.app;

      // properties
      this.user = this.app.util.user;
      this.i18n = this.app.util.i18n;

      // bindings
      this.autologinURL = this.autologinURL.bind(this);
    }

    autologinURL() {
      return `https://${this.i18n.domain()}/xpages/sign-in`;
    }

    render() {
      const { props: { online } } = this;

      return (
        <div id="authenticated-template" className="row">
          <OfflineWarning />

          <CompanyLogo />

          <div className="connection">
            <div>
              <Switch />
            </div>

            <div>
              <CurrentRegion id="region" />
            </div>

            <div className="external-buttons">
              <SettingsIcon />

              <a
                title={t('AccountSettingsText')}
                className={[
                  'col-xs-4',
                  'btn-icon',
                  'btn-account',
                  'invokepop',
                  ...(online ? [] : ['disabled']),
                ].join(' ')}
                href={online ? this.autologinURL() : undefined}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="popover darkpopover arrow-bottom">
                  { t('AccountSettingsText') }
                </div>
              </a>

              <a
                title={t('SupportText')}
                className={[
                  'col-xs-4',
                  'btn-icon',
                  'btn-help',
                  ...(online ? [] : ['disabled']),
                ].join(' ')}
                href={online ? 'https://www.privateinternetaccess.com/helpdesk/' : undefined}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="popover darkpopover arrow-bottom">
                  { t('SupportText') }
                </div>
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      );
    }
  }

  return listenOnline(AuthenticatedTemplate);
}
