import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withAppContext from '@hoc/withAppContext';
import listenOnline from '@hoc/listenOnline';

class MoreLinks extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.user = this.app.util.user;
    this.i18n = this.app.util.i18n;
    this.loginUrl = `https://${this.i18n.domain()}/pages/client-control-panel`;
    this.supportUrl = 'https://www.privateinternetaccess.com/helpdesk/';
    this.state = { open: false };

    // bindings
    this.logout = this.logout.bind(this);
    this.openAccount = this.openAccount.bind(this);
    this.openSupport = this.openSupport.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.openExtraFeatures = this.openExtraFeatures.bind(this);
    this.displayDropdown = this.displayDropdown.bind(this);
    this.documentClickListener = this.documentClickListener.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.documentClickListener);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.documentClickListener);
  }

  documentClickListener() {
    // this is used to close the dropdown if clicked anywhere outside the dropdown
    const { open } = this.state;
    if (open) { this.setState({ open: false }); }
  }

  displayDropdown(event) {
    const { open } = this.state;
    if (open) { this.setState({ open: false }); }
    else { this.setState({ open: true }); }
    event.nativeEvent.stopImmediatePropagation();
  }

  openSettings() {
    if (this.user.getLoggedIn()) { this.history.push('/settings'); }
  }

  openExtraFeatures() {
    if (this.user.getLoggedIn()) { this.history.push('/extrafeatures'); }
  }

  openAccount() {
    const { online } = this.props;
    if (online) { chrome.tabs.create({ url: this.loginUrl }); }
  }

  openSupport() {
    const { online } = this.props;
    if (online) { chrome.tabs.create({ url: this.supportUrl }); }
  }

  logout() {
    if (this.user.getLoggedIn()) {
      this.user.logout()
        .then(() => { return this.history.push('/login'); });
    }
  }

  render() {
    const { open } = this.state;
    const { online } = this.props;

    return (
      <div className="more-links-container noselect">
        <div
          role="button"
          tabIndex="-1"
          className="more-links-target"
          onClick={this.displayDropdown}
          onKeyPress={this.displayDropdown}
        >
          .
          <br />
          .
          <br />
          .
          <br />
        </div>

        <div className={`more-links-dropdown ${open ? 'open' : ''}`}>
          <ul>
            <li>
              <div
                role="button"
                tabIndex="-1"
                className={`${this.user.getLoggedIn() ? '' : 'disabled'}`}
                onClick={this.openExtraFeatures}
                onKeyPress={this.openExtraFeatures}
              >
                { t('ChangeExtraFeaturesSettings') }
              </div>
            </li>

            <li>
              <div
                role="button"
                tabIndex="-1"
                className={`${this.user.getLoggedIn() ? '' : 'disabled'}`}
                onClick={this.openSettings}
                onKeyPress={this.openSettings}
              >
                { t('ChangeExtensionSettings') }
              </div>
            </li>

            <li>
              <div
                role="button"
                tabIndex="-1"
                className={`${online ? '' : 'disabled'}`}
                onClick={this.openAccount}
                onKeyPress={this.openAccount}
              >
                { t('AccountSettingsText') }
              </div>
            </li>

            <li>
              <div
                role="button"
                tabIndex="-1"
                className={`${online ? '' : 'disabled'}`}
                onClick={this.openSupport}
                onKeyPress={this.openSupport}
              >
                { t('SupportText') }
              </div>
            </li>

            <li>
              <div
                role="button"
                tabIndex="-1"
                className={`${this.user.getLoggedIn() ? '' : 'disabled'}`}
                onClick={this.logout}
                onKeyPress={this.logout}
              >
                { t('LogoutText') }
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

MoreLinks.propTypes = {
  online: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default listenOnline(withRouter(withAppContext(MoreLinks)));
