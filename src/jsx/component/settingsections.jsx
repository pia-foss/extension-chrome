import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SettingSection from './settingsection';
import DebugSettingItem from './debugsettingitem';
import {createInitialSectionInfos, createAdjustSectionSettingInfo, createValueUpdater, getTotalCount, getEnabledCount} from '../../js/data/sectionInfos';

class SettingSections extends Component {

  constructor (props) {
    super(props);

    // Bindings
    this.onSettingChange = this.onSettingChange.bind(this);
    this.debugSettingItemBuilder = this.debugSettingItemBuilder.bind(this);

    // Initialization
    const {browser} = props.app.buildinfo;
    const {settings, user} = props.app.util;
    const {languageDropdownBuilder} = this.props;
    const {debugSettingItemBuilder} = this;
    this.state = {
      sectionInfos: createInitialSectionInfos(
        {settings, browser, user},
        {debugSettingItemBuilder, languageDropdownBuilder}
      ),
    };
  }

  onSettingChange (sectionName, settingID, enabled) {
    const adjustSettingValue = createAdjustSectionSettingInfo(sectionName, settingID, createValueUpdater(enabled));
    this.setState(adjustSettingValue);
  }

  debugSettingItemBuilder () {
    return <DebugSettingItem onClick={this.props.onDebugClick} />;
  }

  render () {
    return this.state.sectionInfos
      .map((section) => {
        return (
          <SettingSection
            label={section.label}
            name={section.name}
            totalCount={getTotalCount(section.settingInfos)}
            enabledCount={getEnabledCount(section.settingInfos)}
            key={section.name}
            app={this.props.app}
            settingInfos={section.settingInfos}
            onSettingChange={this.onSettingChange}
          />
        );
      });
  }
}

SettingSections.propTypes = {
  app: PropTypes.object.isRequired,
  onDebugClick: PropTypes.func.isRequired,
  languageDropdownBuilder: PropTypes.func.isRequired,
};

export default SettingSections;
