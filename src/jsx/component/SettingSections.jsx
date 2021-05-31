import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import {
  createSettingsData,
  getSetting,
  getTotalCount,
  getEnabledCount,
} from '@data/settings';
import withAppContext from '@hoc/withAppContext';
import { createSectionsData, getSection } from '@data/sections';
import SettingItem from '@component/SettingItem';
import SettingSection from '@component/SettingSection';
import DebugSettingItem from '@component/DebugSettingItem';
import LanguageDropdown from '@component/LanguageDropdown';

class SettingSections extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.languageDropdown = LanguageDropdown;
    const { settings } = this.app.util;
    this.state = {
      sectionsData: createSectionsData({ t }),
      settingsData: createSettingsData({ t, settings },this.app),
    };

    // bindings
    this.updateLanguage = this.updateLanguage.bind(this);
    this.onSettingChange = this.onSettingChange.bind(this);
    this.getSectionProps = this.getSectionProps.bind(this);
    this.getSettingProps = this.getSettingProps.bind(this);
    this.languageDropdownBuilder = this.languageDropdownBuilder.bind(this);
  }

  onSettingChange(settingID, value) {
    this.setState(({ settingsData }) => {
      return {
        settingsData: settingsData.map((setting) => {
          if (setting.settingID === settingID) {
            return Object.assign({}, setting, { value });
          }

          return setting;
        }),
      };
    });
  }

  getSectionProps(sectionKey) {
    const { sectionsData, settingsData } = this.state;
    const { name, label, defaultOpen } = getSection(sectionKey, sectionsData);
    const enabledCount = getEnabledCount(sectionKey, settingsData);
    const totalCount = getTotalCount(sectionKey, settingsData);

    return {
      name,
      label,
      defaultOpen,
      enabledCount,
      totalCount,
    };
  }

  getSettingProps(settingID) {
    const { settingsData } = this.state;
    const { changeTheme } = this.props;
    const {
      value,
      controllable,
      tooltip,
      label,
      warning,
      learnMore,
      learnMoreHref,
      section,
      available,
    } = getSetting(settingID, settingsData);

    return {
      settingID,
      controllable,
      tooltip,
      label,
      warning,
      learnMore,
      learnMoreHref,
      sectionName: section,
      key: settingID,
      checked: value,
      changeTheme,
      onSettingChange: this.onSettingChange,
      available,
    };
  }

  updateLanguage() {
    const { settings } = this.app.util;
    this.setState({
      sectionsData: createSectionsData({ t }),
      settingsData: createSettingsData({ t, settings },this.app),
    });
  }

  languageDropdownBuilder() {
    const { context: { theme } } = this.props;
    const LanguageDropDown = this.languageDropdown;

    return (
      <div className={`setting-item ${theme} noselect`}>
        <div className="setting-item-label">
          <label htmlFor="languages" className="controllable-setting languages noselect">
            { t('UILanguage') }
            <div className={`popover arrow-bottom ${theme} left-align`}>
              { t('UILanguageTooltip') }
            </div>
          </label>
        </div>
        <div className="checkbox-container">
          <LanguageDropDown updateLanguage={this.updateLanguage} />
        </div>
      </div>
    );
  }

  browserSettings(){
    const { settingsData } = this.state;
    const { onDebugClick, context: { theme } } = this.props;
    
    if(typeof browser == 'undefined'){
      return (
        <SettingSection {...this.getSectionProps('extension')}>
          <SettingItem {...this.getSettingProps('allowExtensionNotifications')} />
          <SettingItem {...this.getSettingProps('alwaysActive')} />
          <SettingItem {...this.getSettingProps('darkTheme')} />
          <SettingItem {...this.getSettingProps('debugmode')} />
          { getSetting('debugmode', settingsData).value
            && <DebugSettingItem onClick={onDebugClick} theme={theme} />
          }
          { this.languageDropdownBuilder() }
        </SettingSection>
      );
    }else{
      return (
        <SettingSection {...this.getSectionProps('extension')}>
          <SettingItem 
          {...this.getSettingProps('alwaysActive')} />
          <SettingItem {...this.getSettingProps('darkTheme')} />
          <SettingItem {...this.getSettingProps('debugmode')} />
          { getSetting('debugmode', settingsData).value
            && <DebugSettingItem onClick={onDebugClick} theme={theme} />
          }
          { this.languageDropdownBuilder() }
        </SettingSection>
      );
    }
  }

  render() {

    return (
      <Fragment>
        { this.browserSettings() }
      </Fragment>
    );
  }
}

SettingSections.propTypes = {
  context: PropTypes.object.isRequired,
  changeTheme: PropTypes.func.isRequired,
  onDebugClick: PropTypes.func.isRequired,
};

export default withAppContext(SettingSections);
