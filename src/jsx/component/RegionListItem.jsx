import PropTypes from 'prop-types';
import React, { Component } from 'react';
import onFlagError from 'eventhandler/templates/changeregion/onFlagError';

class RegionListItem extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.region = props.region;

    // bindings
    this.onClick = this.onClick.bind(this);
    this.favorite = this.favorite.bind(this);
    this.renderLatency = this.renderLatency.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  onClick() {
    this.regionlist.setSelectedRegion(this.region.id);
    return this.app.proxy.enable(this.region).then(() => {
      return this.renderer.renderTemplate('authenticated');
    });
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
        <div className="list-item-latency server-offline-text">
          { t('OfflineText') }
        </div>
      );
    }

    const latency = Math.floor(region.latency);
    let latencyClass = 'latency-red';
    if (latency <= 150) { latencyClass = 'latency-green'; }
    else if (latency <= 500) { latencyClass = 'latency-orange'; }
    const klass = `list-item-latency ${latencyClass}`;
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
      ? 'region-list-item list-group-item active'
      : 'region-list-item list-group-item';
    const favorite = this.region.isFavorite
      ? (
        <div
          role="button"
          tabIndex="-1"
          className="heart-container"
          onClick={this.favorite}
          onKeyPress={this.favorite}
        >
          <img
            alt="Favorite"
            className="heart"
            src="/images/heart-full@2x.png"
          />
        </div>
      )
      : (
        <div
          role="button"
          tabIndex="-1"
          className="heart-container"
          onClick={this.favorite}
          onKeyPress={this.favorite}
        >
          <img
            alt="Favorite"
            className="heart"
            src="/images/heart-outline@2x.png"
          />
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
        { favorite }

        <img
          className="flag"
          alt={this.region.iso}
          src={this.region.flag}
          onError={this.onFlagLoadError}
        />

        <span className="regionnamelist">
          { this.region.localizedName() }
        </span>

        { latencyDiv }
      </div>
    );
  }
}

RegionListItem.propTypes = {
  region: PropTypes.object.isRequired,
};

export default RegionListItem;
