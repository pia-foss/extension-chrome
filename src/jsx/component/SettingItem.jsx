import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Checkbox from '@component/checkbox';
import listenOnline from '@hoc/listenOnline';
import withAppContext from '@hoc/withAppContext';

class SettingItem extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.settings = this.app.util.settings;

    // Bindings
    this.toggle = this.toggle.bind(this);
    this.buildLabel = this.buildLabel.bind(this);
    this.buildWarningSpan = this.buildWarningSpan.bind(this);
    this.i18n = this.app.util.i18n;

  }

  async toggle() {
    const { controllable, settingID, changeTheme } = this.props;

    if (!controllable) { return; }

    try {
      // change settings in background app
      const newValue = await this.settings.toggle(settingID);
      this.app.util.settingsmanager.clearAndReapplySettings(settingID)
      // call parent function to update parent's state
      const { onSettingChange } = this.props;
      if (onSettingChange) { onSettingChange(settingID, newValue); }
      if (changeTheme && settingID === 'darkTheme') { changeTheme(); }
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
      <span className="error-line">
        { message }
      </span>
    );
  }

  buildLabel() {
    const {
      label,
      online,
      tooltip,
      settingID,
      learnMore,
      controllable,
      learnMoreHref,
      
    } = this.props;
    const WarningSpan = this.buildWarningSpan;
    const target = learnMoreHref === '#' ? undefined : '_blank';
    const classNames = controllable ? 'controllable-setting' : 'uncontrollable-setting';
    const theme = this.props.context.getTheme();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';

    return (
      <div className={`${settingID}-item ${lang}`}>
        <a href={settingID} className="noselect">
          <label
            htmlFor={settingID}
            className={classNames}
          >
            { label }
            <div className={`popover arrow-top ${theme} left-align`}>
              { tooltip }
            </div>
          </label>
        </a>

        <WarningSpan />

        { controllable && (
          <div className={`learnmore-container ${settingID}`}>
            <a
              className={`learnmore ${online ? '' : 'disabled'}`}
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
      available,
      controllable,
      component,
    } = this.props;
    

    const theme = this.props.context.getTheme();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';

    return (available)
      ? (
        <div className={`setting-item ${theme} noselect ${lang}`}>
          <div className="setting-item-label">
            { this.buildLabel() }
          </div>
          {component == 'switch' ? <label className="switch">
                <input id={settingID}
                 theme={theme}
                 checked={checked}
                 disabled={!controllable}
                 type="checkbox"
                 onChange={this.toggle} ></input>
                <span className="slider round"></span>
          </label> :
          <Checkbox
            id={settingID}
            theme={theme}
            checked={checked}
            disabled={!controllable}
            onChange={this.toggle}
          />
           }
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
  component: PropTypes.string,
  warning: PropTypes.string,
  online: PropTypes.bool.isRequired,
  changeTheme: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  available: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
};

SettingItem.defaultProps = {
  controllable: true,
  tooltip: '',
  learnMoreHref: '#',
  learnMore: '',
  warning: '',
};

export default listenOnline(withAppContext(SettingItem));
