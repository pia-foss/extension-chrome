import PropTypes from 'prop-types';
import React, { Component } from 'react';

import listenOnline from 'hoc/listenOnline';
import Checkbox from 'component/checkbox';

class SettingItem extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.settings = this.app.util.settings;

    // Bindings
    this.toggle = this.toggle.bind(this);
    this.buildLabel = this.buildLabel.bind(this);
    this.buildWarningSpan = this.buildWarningSpan.bind(this);
  }

  async toggle() {
    const { controllable, settingID } = this.props;

    if (!controllable) { return; }

    try {
      // change settings in background app
      const newValue = await this.settings.toggle(settingID);
      // call parent function to update parent's state
      const { sectionName, onSettingChange } = this.props;
      if (onSettingChange) { onSettingChange(settingID, newValue); }
    }
    catch (err) {
      debug(err);
    }
  }

  buildWarningSpan() {
    const { controllable, settingID, warning } = this.props;

    if (controllable) { return null; }

    let message = null;
    let setting = null;

    try { setting = this.settings.getApiSetting(settingID); }
    catch (_) { setting = undefined; }

    if (warning) { message = warning; }
    else if (setting) {
      let localeKey;
      switch (setting.getLevelOfControl()) {
        case 'controlled_by_other_extensions':
          localeKey = 'SettingControlledByOther';
          break;

        case 'not_controllable':
          localeKey = 'SettingNotControllable';
          break;

        default:
          throw new Error(`No such localeKey for ${setting.getLevelOfControl()}`);
      }
      message = t(localeKey);
    }

    if (!message) { throw new Error('Failed to generate warning message'); }

    return (
      <span className="errorsubline">
        { message }
      </span>
    );
  }

  buildLabel() {
    const {
      label,
      tooltip,
      settingID,
      learnMore,
      controllable,
      learnMoreHref,
      online,
    } = this.props;
    const WarningSpan = this.buildWarningSpan;
    const target = learnMoreHref === '#' ? undefined : '_blank';
    const classNames = controllable ? 'controllable-setting' : 'uncontrollable-setting';

    return (
      <div>
        <a href={settingID} className="macetooltip">
          <label
            htmlFor={settingID}
            className={classNames}
          >
            { label }
            <div className="popover arrow-bottom">
              { tooltip }
            </div>
          </label>
        </a>
        <WarningSpan />
        { controllable && (
          <div className={settingID}>
            <a
              className={[
                'learnmore',
                ...(online ? [] : ['disabled']),
              ].join(' ')}
              href={online ? learnMoreHref : undefined}
              target={target}
            >
              { learnMore }
            </a>
          </div>
        ) }
      </div>
    );
  }

  render() {
    const {
      checked,
      settingID,
      controllable,
      available,
    } = this.props;

    return (available)
      ? (
        <div className="field settingitem noselect">
          <div className="col-xs-10 settingblock">
            { this.buildLabel() }
          </div>
          <Checkbox
            id={settingID}
            className="col-xs-2"
            checked={checked}
            disabled={!controllable}
            onChange={this.toggle}
          />
        </div>
      )
      : '';
  }
}

SettingItem.propTypes = {
  settingID: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  onSettingChange: PropTypes.func.isRequired,
  learnMoreHref: PropTypes.string,
  learnMore: PropTypes.string,
  controllable: PropTypes.bool,
  warning: PropTypes.string,
  sectionName: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  available: PropTypes.bool.isRequired,
  online: PropTypes.bool.isRequired,
};

SettingItem.defaultProps = {
  controllable: true,
  tooltip: '',
  learnMoreHref: '#',
  learnMore: '',
  warning: '',
  disabledValue: false,
};

export default listenOnline(SettingItem);
