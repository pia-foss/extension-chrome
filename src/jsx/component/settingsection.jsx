import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SettingItem from './settingitem';
import { getChecked } from '../../js/data/sectionInfos';

class SettingsSection extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.toggleSection = this.toggleSection.bind(this);

    // Init
    this.state = {open: false};
  }

  get settings () {
    return this.props.app.util.settings;
  }

  toggleSection () {
    this.setState(({open: prevOpen}) => ({open: !prevOpen}));
  }

  render () {
    const {settingInfos} = this.props;
    return (
      <div className={`setting-section sectionwrapper ${this.state.open ? 'open' : 'closed'} ${this.props.name}`}>
        <div className='firstfield field' onClick={this.toggleSection}>
          <div className='col-xs-12 settingblock settingheader noselect'>
            <span className="sectiontitle col-xs-6">{this.props.label}</span>
            <div className="rightalign">
              <span className="counts">{this.props.enabledCount}/{this.props.totalCount} {t("enabled")}</span>
              <span className="expandicon"></span>
            </div>
          </div>
        </div>
        <div className="SettingItemContainer">
          { settingInfos.map((settingInfo) => {
              if (settingInfo.builder) {
                // Inject component
                const Builder = settingInfo.builder;
                return <Builder key={settingInfo.key} />;
              }
              else {
                // Build SettingItem from information
                return (
                  <SettingItem
                    app={this.props.app}
                    sectionName={this.props.name}
                    key={settingInfo.settingID}
                    checked={getChecked(settingInfo)}
                    controllable={settingInfo.controllable}
                    disabledValue={settingInfo.disabledValue}
                    tooltip={settingInfo.tooltip}
                    label={settingInfo.label}
                    warning={settingInfo.warning}
                    learnMore={settingInfo.learnMore}
                    learnMoreHref={settingInfo.learnMoreHref}
                    onSettingChange={this.props.onSettingChange}
                    settingID={settingInfo.settingID}
                  />
                );
              }
            })
          }
        </div>
      </div>
    );
  }
}

SettingsSection.propTypes = {
  app: PropTypes.object.isRequired,
  enabledCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  settingInfos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSettingChange: PropTypes.func,
};

export default SettingsSection;
