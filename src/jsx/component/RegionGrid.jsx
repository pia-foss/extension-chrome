import PropTypes from 'prop-types';
import React, { Component } from 'react';
import RegionGridItem from 'component/RegionGridItem';

class RegionGrid extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.regionsorter = this.app.util.regionsorter;
    this.state = { regions: [], mode: 'loading' };
    this.mounted = false;

    // binding
    this.createGrid = this.createGrid.bind(this);
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

  createGrid(perRow) {
    const grid = [];
    const { regions } = this.state;
    const { showFavorites } = this.props;

    // handle favorites
    regions
      .filter((region) => {
        if (showFavorites) { return region.isFavorite; }
        return true;
      })
      .forEach((region, index) => {
        if (index % perRow === 0) { grid.push([]); }
        grid[grid.length - 1].push(<RegionGridItem key={region.id} region={region} />);
      });

    return grid.map((gridItems, index) => {
      const gridRowIndex = index;
      return (
        <div className="row regionrow" key={gridRowIndex}>
          { gridItems }
        </div>);
    });
  }

  render() {
    const { regions, mode } = this.state;

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
      <div id="region-grid">
        { this.createGrid(2) }
      </div>
    );
  }
}

RegionGrid.propTypes = {
  showFavorites: PropTypes.bool.isRequired,
};

export default RegionGrid;
