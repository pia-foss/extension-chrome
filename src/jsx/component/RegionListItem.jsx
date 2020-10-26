import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withAppContext from '@hoc/withAppContext';
import onFlagError from '@eventhandler/pages/changeregion/onFlagError';
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";

class RegionListItem extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.state = { isAuto: this.regionlist.getIsAuto() };

    // bindings
    this.onClick = this.onClick.bind(this);
    this.favorite = this.favorite.bind(this);
    this.renderFlag = this.renderFlag.bind(this);
    this.renderLatency = this.renderLatency.bind(this);
    this.renderFavorite = this.renderFavorite.bind(this);
    this.renderClassname = this.renderClassname.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  onFlagLoadError(event) {
    return onFlagError(event, this.region);
  }

  async onClick(e) {
    e.stopPropagation();
    this.regionlist.setSelectedRegion(this.region.id);
    await this.app.proxy.enable();
    return this.history.push('/');
  }

  get region() {
    const { region } = this.props;
    return region;
  }

  favorite(e) {
    e.stopPropagation(); // Stops region from being selected
    this.regionlist.setFavoriteRegion(this.region);
    const { context } = this.props;
    context.rebuildApp();
  }

  renderClassname() {
    let classname = 'region-list-item';
    const { isAuto } = this.state;
    const { nested, context: { theme } } = this.props;
    const isSelected = this.regionlist.isSelectedRegion(this.region);
    if (!isAuto && isSelected) { classname += ' active'; }
    if (nested) { classname += ' nested'; }
    if (theme) { classname += ` ${theme}`; }
    return classname;
  }

  renderFlag() {
    if (this.region.override) { return <div className="empty-flag" />; }
    const { nested } = this.props;
    if (nested) { return ''; }

    return (
      <img
        className="flag"
        alt={this.region.iso}
        src={this.region.flag}
        onError={this.onFlagLoadError}
      />
    );
  }

  renderLatency() {
    if (this.region.offline) {
      return (
        <div className="list-item-latency server-offline-text">
          { t('OfflineText') }
        </div>
      );
    }

    const latency = Math.floor(this.region.latency);
    const latencyClass = (() => {
      if (latency === 'ERROR' || latency > 500 || latency === 'PENDING') { return 'latency-red'; }
      if (latency <= 150 && latency > 0) { return 'latency-green'; }
      if (latency <= 500 && latency > 150) { return 'latency-orange'; }
      debug(`invalid latency: ${latency}`);
      return 'latency-red';
    })();

      const loading = <BeatLoader
                          size={5}
                          margin={2}
                          color={"#66ab00"}
                          loading={true}
                        />;
    const latencyValue = (() => {
      if (latency === 'PENDING') { return 'waiting'; }
      if (latency === 'ERROR') { return loading; }
      if (typeof latency === 'number' && latency >= 0) { return `${latency} ms`; }
      debug(`RegionListItem: invalid latency: ${latency}`);
      return  loading;
    })();


    return (
      <div className={`list-item-latency ${latencyClass}`}>
        { latencyValue }
      </div>
    );
  }

  renderFavorite() {
    const { isFavorite } = this.region;
    const heartUrl = isFavorite ? '/images/heart-full@3x.png' : '/images/heart-outline@3x.png';

    return (
      <div
        role="button"
        tabIndex="-1"
        className={`heart-container ${isFavorite ? 'active' : ''}`}
        onClick={this.favorite}
        onKeyPress={this.favorite}
      >
        <img
          alt="Favorite"
          className="heart"
          src={heartUrl}
        />
      </div>
    );
  }

  render() {
    const className = this.renderClassname();
    const flag = this.renderFlag();
    const favorite = this.renderFavorite();
    const latencyDiv = this.renderLatency();
  
    return (
      <div
        role="button"
        tabIndex="-1"
        className={className}
        data-region-id={this.region.id}
        data-region-latency={this.region.latency}
        onClick={this.onClick}
        onKeyPress={this.onClick}
      >
        <div className="arrow-container" />

        <div className="flag-container">
          { flag }
        </div>

        <span className="regionnamelist">
          { this.region.localizedName() }
        </span>

        { latencyDiv }

        { favorite }
      </div>
    );
  }
}

RegionListItem.propTypes = {
  nested: PropTypes.bool,
  region: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

RegionListItem.defaultProps = {
  nested: false,
};

export default withRouter(withAppContext(RegionListItem));
