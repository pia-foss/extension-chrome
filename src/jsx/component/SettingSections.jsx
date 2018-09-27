import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SettingSection from './SettingSection';
import DebugSettingItem from './DebugSettingItem';
import {
  createInitialSectionInfos,
  createAdjustSectionSettingInfo,
  createValueUpdater,
  getTotalCount,
  getEnabledCount,
} from '../../js/data/sectionInfos';

class SettingSections extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // Bindings
    this.onSettingChange = this.onSettingChange.bind(this);
    this.debugSettingItemBuilder = this.debugSettingItemBuilder.bind(this);

    // Initialization
    const { settings, user } = this.app.util;
    const { debugSettingItemBuilder } = this;
    const browserType = this.app.buildinfo.browser;
    const { languageDropdownBuilder } = this.props;
    this.state = {
      sectionInfos: createInitialSectionInfos(
        { settings, browser: browserType, user },
        { debugSettingItemBuilder, languageDropdownBuilder },
      ),
    };
  }

  onSettingChange(sectionName, settingID, enabled) {
    const valueUpdater = createValueUpdater(enabled);
    const adjustSettingValue = createAdjustSectionSettingInfo(sectionName, settingID, valueUpdater);
    this.setState(adjustSettingValue);
  }

  debugSettingItemBuilder() {
    const { onDebugClick } = this.props;
    return <DebugSettingItem onClick={onDebugClick} />;
  }

  render() {
    const { sectionInfos } = this.state;
    return sectionInfos.map((section) => {
      return (
        <SettingSection
          label={section.label}
          name={section.name}
          totalCount={getTotalCount(section.settingInfos)}
          enabledCount={getEnabledCount(section.settingInfos)}
          key={section.name}
          settingInfos={section.settingInfos}
          onSettingChange={this.onSettingChange}
        />
      );
    });
  }
}

SettingSections.propTypes = {
  onDebugClick: PropTypes.func.isRequired,
  languageDropdownBuilder: PropTypes.func.isRequired,
};

export default SettingSections;
