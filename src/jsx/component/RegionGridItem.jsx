import PropTypes from 'prop-types';
import React, { Component } from 'react';
import onFlagError from 'eventhandler/templates/changeregion/onFlagError';

class RegionGridItem extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.region = props.region;
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;

    // bindings
    this.onClick = this.onClick.bind(this);
    this.favorite = this.favorite.bind(this);
    this.renderLatency = this.renderLatency.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  async onClick() {
    this.regionlist.setSelectedRegion(this.region.id);
    await this.app.proxy.enable(this.region);
    return this.renderer.renderTemplate('authenticated');
  }

  onFlagLoadError(event) {
    return onFlagError(event, this.region);
  }

  favorite(e) {
    e.stopPropagation(); // Stops region from being selected
    const editedRegion = this.regionlist.setFavoriteRegion(this.region);
    this.setState(editedRegion);
  }

  renderLatency(region) {
    if (this.storage.getItem('sortby') !== 'latency') { return undefined; }

    if (region.offline) {
      return (
        <div className="col-xs-12 text-center server-offline-text">
          { t('OfflineText') }
        </div>
      );
    }

    const latency = Math.floor(region.latency);
    let latencyClass = 'latency-red';
    if (latency <= 150) { latencyClass = 'latency-green'; }
    else if (latency <= 500) { latencyClass = 'latency-orange'; }
    const klass = `col-xs-12 text-center grid-item-latency ${latencyClass}`;
    return (
      <div className={klass}>
        { latency }
        ms
      </div>
    );
  }

  render() {
    const latencyDiv = this.renderLatency(this.region);
    const className = this.regionlist.isSelectedRegion(this.region)
      ? 'col-xs-6 regionbox active'
      : 'col-xs-6 regionbox';
    const favorite = this.region.isFavorite
      ? (
        <div role="button" tabIndex="-1" onClick={this.favorite} onKeyPress={this.favorite}>
          <img alt="Favorite" className="heart" src="/images/heart-full@2x.png" />
        </div>
      )
      : (
        <div role="button" tabIndex="-1" onClick={this.favorite} onKeyPress={this.favorite}>
          <img alt="Favorite" className="heart" src="/images/heart-outline@2x.png" />
        </div>
      );

    return (
      <div
        role="button"
        tabIndex="-1"
        className={className}
        data-region-latency={this.region.latency}
        data-region-id={this.region.id}
        onClick={this.onClick}
        onKeyPress={this.onClick}
      >
        <div className="regionwrapper">
          { favorite }

          <div className="col-xs-12 flag text-center">
            <img alt={this.region.iso} src={this.region.flag} onError={this.onFlagLoadError} />
          </div>

          <div className="col-xs-12 name text-center">
            { this.region.localizedName() }
          </div>

          { latencyDiv }
        </div>
      </div>
    );
  }
}

RegionGridItem.propTypes = {
  region: PropTypes.object.isRequired,
};

export default RegionGridItem;
