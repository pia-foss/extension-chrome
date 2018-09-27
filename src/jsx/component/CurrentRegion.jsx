import React, { Component } from 'react';
import onFlagError from 'eventhandler/templates/changeregion/onFlagError';

class CurrentRegion extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.region = this.app.util.regionlist.getSelectedRegion();

    // bindings
    this.changeRegion = this.changeRegion.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  onFlagLoadError(event) {
    return onFlagError(event, this.region);
  }

  changeRegion() {
    return this.renderer.renderTemplate('change_region');
  }

  render() {
    return (
      <div
        role="button"
        tabIndex="-1"
        className="current-region"
        onClick={this.changeRegion}
        onKeyPress={this.changeRegion}
      >
        <div className="go-forward-image" />

        <div className="flag">
          {
            this.region
              ? <img alt={this.region.iso} onError={this.onFlagLoadError} src={this.region.flag} />
              : <div className="empty-flag" />
          }
        </div>

        <div className="title">
          { t('CurrentRegionText') }
        </div>

        <div className="name">
          {
            this.region
              ? this.region.localizedName()
              : t('NoRegionSelected')
          }
        </div>
      </div>
    );
  }
}

export default CurrentRegion;
