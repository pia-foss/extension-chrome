import React, {Component} from 'react';
import PropTypes from 'prop-types';

class SettingItem extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.buildWarningSpan = this.buildWarningSpan.bind(this);
    this.buildLabel = this.buildLabel.bind(this);
    this.toggle = this.toggle.bind(this);
    this.callOnSettingChange = this.callOnSettingChange.bind(this);
  }

  get settings () { return this.props.app.util.settings; }

  callOnSettingChange (newValue) {
    this.props.onSettingChange && this.props.onSettingChange(this.props.sectionName, this.props.settingID, newValue);
  }

  async toggle () {
    if (!this.props.controllable) {
      return;
    }

    const {settings} = this;
    const {settingID} = this.props;

    try {
      const newValue = await settings.toggle(settingID);
      this.callOnSettingChange(newValue);
    }
    catch (err) {
      if (err.message) {
        console.error(debug(err.message));
        if (err.stack) console.log(err.stack);
      }
      else {
        console.error(debug(JSON.stringify(err)));
      }
    }
  }

  buildWarningSpan () {
    if (this.props.controllable) {
      return null;
    }

    let message = null;
    const {settingID, warning} = this.props;
    let setting = null;
    try {
      setting = this.settings.getApiSetting(settingID);
    } catch (_) {
      setting = undefined;
    }

    if (warning) {
      message = warning;
    }
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

    if (!message) {
      throw new Error('Failed to generate warning message');
    }

    return (
      <span className="errorsubline">
        {message}
      </span>
    );
  }

  buildLabel () {
    const {controllable, settingID, label, tooltip} = this.props;
    const learnMoreHref = this.props.learnMoreHref || '#';
    const learnMore = this.props.learnMore || '';
    const WarningSpan = this.buildWarningSpan;
    const target = learnMoreHref === '#' ? undefined : '_blank';
    const classNames = controllable ? 'controllable-setting' : 'uncontrollable-setting';

    return (
      <div>
        <a className="macetooltip">
          <label
            htmlFor={settingID}
            className={classNames}
          >{label}
            <div className="popover arrow-bottom">{tooltip}</div>
          </label>
        </a>
        <WarningSpan />
        <div className={settingID}>
          <a className="learnmore" href={learnMoreHref} target={target}>{learnMore}</a>
        </div>
      </div>
    );
  }

  render () {
    const { settingID, controllable, checked } = this.props;

    return (
      <div className='field settingitem noselect'>
        <div className='col-xs-10 settingblock'>
          {this.buildLabel()}
        </div>
        <div className="col-xs-2 checkmarkcontainer">
          <input
            onChange={this.toggle}
            disabled={!controllable}
            checked={checked}
            type="checkbox"
            id={settingID}
          />
          <label
            className="checkboxlabel"
            htmlFor={settingID}
          />
        </div>
      </div>
    );
  }
}

SettingItem.propTypes = {
  app: PropTypes.object.isRequired,
  settingID: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  onSettingChange: PropTypes.func,
  learnMoreHref: PropTypes.string,
  learnMore: PropTypes.string,
  controllable: PropTypes.bool,
  warning: PropTypes.string,
  sectionName: PropTypes.string.isRequired,
  disabledValue: PropTypes.bool,
  checked: PropTypes.bool.isRequired,
};

SettingItem.defaultProps = {
  controllable: true,
};

export default SettingItem;
