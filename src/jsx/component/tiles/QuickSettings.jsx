import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Tile from '@component/tiles/Tile';
import withAppContext from '@hoc/withAppContext';

class QuickSettings extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.sameApp = this.app.sameApp;
    this.history = props.history;
    this.settings = this.app.util.settings;
    this.state = {
      optionDisplay: '',
      settings: {
        maceprotection: { id: 'maceprotection', display: t('MACE'), folder: 'mace' },
        blockreferer: { id: 'blockreferer', display: t('HTTPREFERRER'), folder: 'referer' },
        debugmode: { id: 'debugmode', display: t('DEBUGLOGGING'), folder: 'debug' },
        darkTheme: { id: 'darkTheme', display: t('LIGHTTHEME'), folder: 'theme' },
        viewAll: { id: 'viewAll', display: t('VIEWALL'), folder: 'more' },
      }
    };

    // bindings
    this.onClick = this.onClick.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.generateSetting = this.generateSetting.bind(this);
    this.generateSettings = this.generateSettings.bind(this);

    if(typeof browser == 'undefined'){
      this.state.settings['blockcamera'] = { id: 'blockcamera', display: t('BLOCKCAMERA'), folder: 'camera' };
      this.state.settings['blockmicrophone'] = { id: 'blockmicrophone', display: t('BLOCKMICROPHONE'), folder: 'audio' };
    }else{
      this.state.settings["fingerprintprotection"] = { id: 'fingerprintprotection', display: t('FPPROTECTION'), folder: 'fp' }
    } 
  }

  onClick(e) {
    const { optionId } = e.currentTarget.dataset;
    this.settings.toggle(optionId)
      .then((newValue) => {
        const { settings } = this.state;
        settings[optionId].value = newValue;
        this.setState({ settings });
        return newValue;
      })
      .then((newValue) => {
        if (optionId === 'darkTheme') { this.changeTheme(newValue); }
      });
  }

  onMouseEnter(e) {
    e.stopPropagation();
    const { settings } = this.state;
    const { optionId, optionDisplay } = e.currentTarget.dataset;
    settings[optionId].hover = true;
    this.setState({ optionDisplay, settings });
  }

  onMouseLeave(e) {
    e.stopPropagation();
    const { settings } = this.state;
    Object.values(settings).forEach((setting) => {
      const settingData = setting;
      settingData.hover = false;
    });
    this.setState({ optionDisplay: '', settings });
  }

  changeTheme(newValue) {
    const { context: { updateTheme } } = this.props;
    if (newValue) { updateTheme('dark'); }
    else { updateTheme('light'); }
  }

  generateSettings() {
    const { settings } = this.state;
    return Object.values(settings).map(this.generateSetting);
  }

  generateSetting(setting) {
    const { context: { theme } } = this.props;

    // determine setting state
    let active = false;
    if (setting.id !== 'viewAll') { active = this.settings.getItem(setting.id); }
    if (setting.id === 'darkTheme') { active = !active; }

    /**
     * Visuals:
     * dark inactive - grey40
     * dark inactive hover - grey85
     * dark active - greenDark20
     * dark active hover - green
     *
     * light inactive - grey55
     * light inactive hover - grey40
     * light active - greenDark20
     * light active hover green
     */

    // figure out image to display
    let imgUrl = '';
    const { hover } = setting;
    const baseUrl = `/images/tiles/${setting.folder}`;
    if (active && hover) { imgUrl = `${baseUrl}/green.png`; }
    else if (active) { imgUrl = `${baseUrl}/greenDark20.png`; }
    else if (theme === 'dark' && hover) { imgUrl = `${baseUrl}/grey85.png`; }
    else if (theme === 'dark') { imgUrl = `${baseUrl}/grey40.png`; }
    else if (hover) { imgUrl = `${baseUrl}/grey40.png`; }
    else { imgUrl = `${baseUrl}/grey55.png`; }

    // determine click action
    let action = this.onClick;
    if (setting.id === 'viewAll') { action = this.renderSettings; }

    return (
      <div
        key={setting.id}
        role="button"
        tabIndex="-1"
        className={`quick-settings-option ${active ? 'active' : ''} ${theme}`}
        data-option-id={setting.id}
        data-option-display={setting.display}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={action}
        onKeyPress={action}
      >
        <img
          alt={setting.display}
          src={imgUrl}
        />
      </div>
    );
  }

  renderSettings() {
    this.history.push('/settings');
  }

  render() {
    const { optionDisplay } = this.state;
    const { context: { theme } } = this.props;
    const { saved, hideFlag, toggleTileSaved } = this.props;

    return (
      <Tile
        name="QuickSettings"
        saved={saved}
        hideFlag={hideFlag}
        toggleTileSaved={toggleTileSaved}
      >
        <div className={`quick-settings ${theme}`}>
          <div className="quick-settings-header">
            { `${optionDisplay ? `${optionDisplay}` : `${t('QuickSettings')}`}` }
          </div>

          <div className="quick-settings-options">
            { this.generateSettings() }
          </div>
        </div>
      </Tile>
    );
  }
}

QuickSettings.propTypes = {
  saved: PropTypes.bool.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

export default withRouter(withAppContext(QuickSettings));
