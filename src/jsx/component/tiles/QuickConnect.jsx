import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tile from '@component/tiles/Tile';
import withAppContext from '@hoc/withAppContext';
import LoadingEllipsis from '@component/LoadingEllipsis';
import onFlagError from '@eventhandler/pages/changeregion/onFlagError';

class QuickConnect extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.proxy = this.app.proxy;
    this.regionlist = this.app.util.regionlist;
    this.regionsorter = this.app.util.regionsorter;
    this.state = { regionName: '' };

    // bindings
    this.onClick = this.onClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.renderFlag = this.renderFlag.bind(this);
    this.filterRegions = this.filterRegions.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
    this.createComponent = this.createComponent.bind(this);
    this.filterFavRegions = this.filterFavRegions.bind(this);
    this.componentizeRegions = this.componentizeRegions.bind(this);
  }

  onClick(e) {
    e.stopPropagation();
    const { region } = this.props;
    const { regionId } = e.target.dataset;

    if (region.id === regionId && this.proxy.enabled()) { return; }

    const { onQuickConnect } = this.props;
    onQuickConnect(regionId);
  }

  onMouseEnter(e) {
    e.stopPropagation();
    const { regionName } = e.target.dataset;
    this.setState({ regionName });
  }

  onMouseLeave(e) {
    e.stopPropagation();
    this.setState({ regionName: '' });
  }

  onFlagLoadError(e) {
    const { regionId } = e.target.dataset;
    const regions = this.regionlist.toArray();
    const thisRegion = regions.filter((currentRegion) => {
      return regionId === currentRegion.id;
    });

    return onFlagError(e, thisRegion[0]);
  }

  filterFavRegions(regions) {
    return this.regionsorter.latencySort(regions)
      .filter((region) => { return region.isFavorite; });
  }

  filterRegions(regions) {
    // group regions by ISO
    return this.regionsorter.latencySort(regions)
      .reduce((prev, curr) => {
        const isoMap = prev;
        if (isoMap[curr.iso]) { return isoMap; }
        isoMap[curr.iso] = curr;
        return isoMap;
      }, {});
  }

  componentizeRegions() {
    const regions = this.regionlist.toArray();
    const allRegions = this.filterRegions(regions);
    const favoriteRegions = this.filterFavRegions(regions);

    const componentRegions = [];

    Object.values(favoriteRegions)
      .forEach((isoRegions) => {
        const region = isoRegions;
        componentRegions.push(this.createComponent(region, true));
      });

    if (componentRegions.length > 6) { return componentRegions.slice(0, 6); }
    if (componentRegions.length === 6) { return componentRegions; }

    Object.values(allRegions)
      .forEach((isoRegions) => {
        const region = isoRegions;

        const included = Object.values(favoriteRegions).includes(region);
        if (included) { return; }

        componentRegions.push(this.createComponent(region));
      });

    if (componentRegions.length > 6) { return componentRegions.slice(0, 6); }

    return componentRegions;
  }

  createComponent(newRegion, isFav) {
    // update mode, connection, and region here?
    const { mode, connection, region } = this.props;
    const classList = [];
    classList.push('connect-region');
    if (region && region.id === newRegion.id) { classList.push(mode, connection); }
    const className = classList.join(' ');

    return (
      <div
        key={newRegion.id}
        className={className}
      >
        <div className="flag-container">
          { this.renderFlag(newRegion, isFav) }
        </div>
      </div>
    );
  }

  renderFlag(region, isFavorite) {
    if (isFavorite) {
      const { context: { theme } } = this.props;

      let heartUrl = '/images/green-heart-outline-light.svg';
      if (theme === 'dark') { heartUrl = '/images/green-heart-outline-dark.svg'; }

      return (
        <div className="fav-region">
          <div
            role="button"
            tabIndex="-1"
            className="flag-clickable"
            onClick={this.onClick}
            onKeyPress={this.onClick}
          >
            <img
              className="flag"
              alt={region.iso}
              src={region.flag}
              data-region-id={region.id}
              data-region-name={region.localizedName()}
              onError={this.onFlagLoadError}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
            />
          </div>

          <img
            alt="Favorite"
            className={`flag-heart ${theme}`}
            src={heartUrl}
          />
        </div>
      );
    }

    return (
      <div
        role="button"
        tabIndex="-1"
        className="flag-clickable"
        onClick={this.onClick}
        onKeyPress={this.onClick}
      >
        <img
          className="flag"
          alt={region.iso}
          src={region.flag}
          data-region-id={region.id}
          data-region-name={region.localizedName()}
          onError={this.onFlagLoadError}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />
      </div>
    );
  }

  render() {
    const { regionName } = this.state;
    const hasRegions = this.regionlist.hasRegions();
    const {
      saved,
      region,
      regions,
      hideFlag,
      toggleTileSaved,
      context: { theme },
    } = this.props;
    const pending = regions.some((current) => { return current.latency === 'PENDING'; });

    if (!region) {
      return (
        <Tile
          name="QuickConnect"
          saved={saved}
          hideFlag={hideFlag}
          toggleTileSaved={toggleTileSaved}
        >
          <div className={`quick-connect ${theme}`}>
            <div className="quick-connect-header">
              { t('QuickConnect') }
            </div>

            <div className="quick-connect-warning">
              <LoadingEllipsis theme={theme} />
            </div>
          </div>
        </Tile>
      );
    }

    if (!hasRegions) {
      return (
        <Tile
          name="QuickConnect"
          saved={saved}
          hideFlag={hideFlag}
          toggleTileSaved={toggleTileSaved}
        >
          <div className={`quick-connect ${theme}`}>
            <div className="quick-connect-header">
              { t('QuickConnect') }
            </div>

            <div className={`quick-connect-warning ${theme}`}>
              { t('NoRegionsFound') }
            </div>
          </div>
        </Tile>
      );
    }

    return (
      <Tile
        name="QuickConnect"
        saved={saved}
        hideFlag={hideFlag}
        toggleTileSaved={toggleTileSaved}
      >
        <div className={`quick-connect ${theme}`}>
          <div className="quick-connect-header">
            { `${t('QuickConnect')} ${regionName ? `- ${regionName}` : ''}` }
          </div>

          <div className="quick-connect-flags">
            { this.componentizeRegions() }
          </div>
        </div>
      </Tile>
    );
  }
}

QuickConnect.propTypes = {
  region: PropTypes.object,
  regions: PropTypes.array,
  saved: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  connection: PropTypes.string.isRequired,
  onQuickConnect: PropTypes.func.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

QuickConnect.defaultProps = {
  regions: [],
  region: undefined,
};

export default withAppContext(QuickConnect);
