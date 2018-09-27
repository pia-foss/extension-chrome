import PropTypes from 'prop-types';
import React, { Component } from 'react';
import RegionListItem from 'component/RegionListItem';

class RegionList extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.regionsorter = this.app.util.regionsorter;
    this.state = { regions: [], mode: 'loading' };
    this.mounted = false;

    // bindings
    this.sortRegions = this.sortRegions.bind(this);
    this.updateRegions = this.updateRegions.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    return this.sortRegions();
  }

  componentDidUpdate() {
    const active = document.querySelector('div#regions .active');
    if (active) { active.scrollIntoView(); }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  sortRegions() {
    const mode = 'render';
    const allRegions = this.regionlist.toArray();
    const sortType = this.storage.getItem('sortby');

    let sort = this.regionsorter.nameSort;
    if (sortType === 'latency') { sort = this.regionsorter.latencySort; }

    sort(allRegions).then((regions) => {
      if (this.mounted) { this.setState({ regions, mode }); }
    });
  }

  updateRegions() {
    this.setState({ mode: 'loading' });
    this.regionlist.sync().then(this.sortRegions);
  }

  render() {
    const { regions, mode } = this.state;
    const { showFavorites } = this.props;
    const listItems = regions
      .filter((region) => {
        if (showFavorites) { return region.isFavorite; }
        return true;
      })
      .map((region) => {
        return (<RegionListItem key={region.id} region={region} />);
      });

    // Loading screen when between actions
    if (mode === 'loading') {
      return (
        <div id="region-list">
          <div className="loader" />
        </div>
      );
    }

    // No Regions Found screen if no regions exists
    if (regions.length === 0) {
      return (
        <div id="region-list" className="no-regions">
          <div className="no-regions">
            <div className="no-regions-title">
              { t('NoRegionsFound') }
            </div>

            <button
              type="button"
              className="btn btn-success"
              onClick={this.updateRegions}
            >
              { t('RefreshRegions') }
            </button>
          </div>
        </div>
      );
    }

    // Render regions
    return (
      <div id="region-list">
        <ul className="list-group">
          { listItems }
        </ul>
      </div>
    );
  }
}

RegionList.propTypes = {
  showFavorites: PropTypes.bool.isRequired,
};

export default RegionList;
