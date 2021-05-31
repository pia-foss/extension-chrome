import PropTypes from 'prop-types';
import React, { Component } from 'react';

import listenOnline from '@hoc/listenOnline';
import withAppContext from '@hoc/withAppContext';
import CompanyLogo from '@component/CompanyLogo';

class FingerprintOptInPage extends Component {
  constructor(props) {
    super(props);

    // Properties
    this.app = props.context.app;
    this.proxy = this.app.proxy;
    this.user = this.app.util.user;
    this.storage = this.app.util.storage;
    this.settings = this.app.util.settings;
    this.fingerprintProtectionSetting = this.app.chromesettings.fingerprintprotection;
    this.fingerprintProtectionSettingId = this.app.chromesettings.fingerprintprotection.settingID;

    // Bindings
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.updateView = this.updateView.bind(this);

    // Init
    // if the Fingerprint setting is not controllable then call updateView
    const controllable = this.settings.getControllable(this.fingerprintProtectionSettingId);
    if (!controllable) { this.updateView(); }
  }

  enable() {
    // update the setting value in storage
    this.settings.setItem(this.fingerprintProtectionSettingId, true);
    this.settings.setItem('firstRun', false);

    // Restart the proxy to apply the change in fingerprint protection settings
    let promise;
    const proxyOnline = this.storage.getItem('online') === 'true';
    if (proxyOnline) { promise = this.proxy.enable(); }
    else { promise = Promise.resolve(); }

    // Redirect user to the correct view based on whether they are logged in
    return promise.then(() => { return this.updateView(); });
  }

  disable() {
    // update the value in storage
    this.settings.setItem(this.fingerprintProtectionSettingId, false);
    this.settings.setItem('firstRun', false);

    // Manually disable fingerprintProtection since restarting the proxy will not disable it
    // Additionally, we want to disable this setting if the proxy is on or not
    this.fingerprintProtectionSetting.clearSetting();

    // Redirect user to the correct view based on whether they are logged in
    return this.updateView();
  }

  updateView() {
    const { context: { updateFirstRun } } = this.props;
    return updateFirstRun();
  }

  render() {
    const { context: { theme }, online } = this.props;

    return (
      <div className={`row page fingerprint-opt-in ${theme}`}>
        <CompanyLogo hideLinks={true} />

        <div className="fingerprint-disclaimer-header">
          { t('FingerprintProtectionHeader') }
        </div>

        <div className="fingerprint-section">
          <p>
            { t('FingerprintProtectionDisclaimer') }
          </p>

          <div className="fingerprint-disclaimer-link">
            <a
              href={online ? 'https://wiki.mozilla.org/Security/Fingerprinting' : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={online ? '' : 'disabled'}
            >
              Mozilla Wiki - Security/Fingerprinting
            </a>
          </div>
        </div>

        <div className="fingerprint-section">
          <div className="fingerprint-options">
            { t('FingerprintProtectionInstructions') }
          </div>

          <div className="fingerprint-options-buttons">
            <button
              type="button"
              className="btn btn-success enable"
              onClick={this.enable}
            >
              { t('FingerprintProtectionEnable') }
            </button>

            <button
              type="button"
              className="btn btn-success disable"
              onClick={this.disable}
            >
              { t('FingerprintProtectionDisable') }
            </button>
          </div>
        </div>

        <div className="fingerprint-section">
          { t('FingerprintProtectionAfterword') }
        </div>
      </div>
    );
  }
}

FingerprintOptInPage.propTypes = {
  online: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
};

export default withAppContext(listenOnline(FingerprintOptInPage));
