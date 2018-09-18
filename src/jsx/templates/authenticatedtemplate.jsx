import React, { Component } from 'react';
import Switch from '../component/switch';
import CompanyLogo from '../component/CompanyLogo';
import OfflineWarning from '../component/OfflineWarning';
import initCurrentRegion from '../component/currentregion';
import initActionButton from '../component/actionbutton';
import initSettingsIcon from '../component/settingsicon';

export default function (renderer, app, window, document) {
  const CurrentRegion = initCurrentRegion(renderer, app, window, document);
  const ActionButton = initActionButton(renderer, app, window, document);
  const SettingsIcon = initSettingsIcon(renderer, app, window, document);

  return class extends Component {
    constructor(props) {
      super(props);

      // properties
      this.user = app.util.user;
      this.i18n = app.util.i18n;
      this.regionlist = app.util.regionlist;
      this.state = { region: this.regionlist.getSelectedRegion() };

      // bindings
      this.logout = this.logout.bind(this);
      this.autologinURL = this.autologinURL.bind(this);
    }

    logout() {
      return this.user.logout(() => {
        return renderer.renderTemplate('login');
      });
    }

    autologinURL() {
      return `https://${this.i18n.domain()}/xpages/sign-in`;
    }

    render() {
      const { region } = this.state;
      return (
        <div id="authenticated-template" className="row">
          <OfflineWarning />

          <CompanyLogo />

          <div className="connection">
            <div>
              <Switch app={app} />
            </div>

            <div>
              <CurrentRegion id="region" region={region} />
            </div>

            <div className="external-buttons">
              <SettingsIcon />

              <a
                title={t('AccountSettingsText')}
                className="col-xs-4 btn-icon btn-account invokepop"
                href={this.autologinURL()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="popover darkpopover arrow-bottom">
                  { t('AccountSettingsText') }
                </div>
              </a>

              <a
                title={t('SupportText')}
                className="col-xs-4 btn-icon btn-help"
                href="https://www.privateinternetaccess.com/helpdesk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="popover darkpopover arrow-bottom">
                  { t('SupportText') }
                </div>
              </a>

              <ActionButton
                extraClassList="col-xs-3 btn-icon btn-logout"
                title={t('LogoutText')}
                tooltip={t('LogoutText')}
                callback={this.logout}
              />
            </div>
          </div>
        </div>
      );
    }
  };
}
