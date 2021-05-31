import PropTypes from 'prop-types';
import Switch from '@component/Switch';
import React, { Component } from 'react';
import RegionIso from '@component/RegionIso';
import RegionAuto from '@component/RegionAuto';
import withAppContext from '@hoc/withAppContext';
import RegionListItem from '@component/RegionListItem';
import * as _ from 'lodash';
class RegionList extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.regionsorter = this.app.util.regionsorter;

    // bindings
    this.filterRegions = this.filterRegions.bind(this);
    this.renderAutoRegion = this.renderAutoRegion.bind(this);
    this.componentizeRegions = this.componentizeRegions.bind(this);
  }

  filterRegions(regions) {
    const { sortBy, search, showFavorites } = this.props;

    // determine sort order
    let sort = this.regionsorter.nameSort;
    if (sortBy === 'latency') { sort = this.regionsorter.latencySort; }

    // sort by name or latency
    return sort(regions)
      // filter by search input
      .filter((region) => {
        return region.localizedName().toLowerCase().includes(search.toLowerCase());
      })
      // filter favorites
      .filter((region) => {
        if (showFavorites) { return region.isFavorite; }
        return true;
      })
      // group regions by ISO
      .reduce((prev, curr) => {
        const isoMap = prev;
        if (isoMap[curr.iso]) { isoMap[curr.iso].push(curr); }
        else { isoMap[curr.iso] = [curr]; }
        return isoMap;
      }, {});
  }
  

  componentizeRegions() {
    const { regions } = this.props;
    const filteredRegions = this.filterRegions(regions);

    const componentRegions = [];
    Object.values(filteredRegions)
      .forEach((isoRegions) => {
        const region = isoRegions[0];

        if (isoRegions.length === 1) {
          componentRegions.push((
            <RegionListItem key={region.id} region={region} />
          ));
        }
        else {
          const { iso } = region;
          componentRegions.push((
            <RegionIso key={iso} iso={iso} regions={isoRegions} />
          ));
        }
      });

    return componentRegions;
  }

  renderAutoRegion() {
    const { regions } = this.props;
    const hasRegions = this.regionlist.hasRegions();
    const pending = regions.some((current) => { return current.latency === 'PENDING'; });

    if (!hasRegions || pending) { return ''; }

    const region = this.regionsorter.latencySort(regions)[0];
    return (<RegionAuto region={region} />);
  }

  render() {
    const filteredRegions = this.componentizeRegions();
    const {
      mode,
      regions,
      syncRegions,
      verifyLatencyRegions,
      context: { theme },
    } = this.props;
    
    // Loading screen when between actions
    if (mode === 'loading') {
      return (
        <div className="regions centered">
          <Switch
            theme={theme}
            mode="connecting"
            classes="waiting region"
            connection="disconnected"
            onToggleConnection={() => {}}
          />
        </div>
      );
    }

    // No Regions Found screen if no regions exists
    if (regions.length === 0) {
      return (
        <div className="no-regions">
          <div className={`no-regions-title ${theme}`}>
            { t('NoRegionsFound') }
          </div>

          <button type="button" className="btn btn-success" onClick={syncRegions}>
            { t('RefreshRegions') }
          </button>
        </div>
      );
    }
    verifyLatencyRegions(regions);
    // Render regions
    return (
      <div className="regions">
        <div className="auto-region">
          { this.renderAutoRegion() }
        </div>
        <ul className="region-list">
          { filteredRegions }
        </ul>
      </div>
    );
  }
}

RegionList.propTypes = {
  mode: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  regions: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  syncRegions: PropTypes.func.isRequired,
  showFavorites: PropTypes.bool.isRequired,
};

export default withAppContext(RegionList);
