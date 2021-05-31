import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PageTitle from '@component/PageTitle';
import RegionList from '@component/RegionList';
import withAppContext from '@hoc/withAppContext';
import RegionSearch from '@component/RegionSearch';

class ChangeRegionPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.mounted = false;
    this.app = props.context.app;
    this.storage = this.app.util.storage;
    this.settings = this.app.util.settings;
    this.regionlist = this.app.util.regionlist;
    this.state = {
      search: '',
      mode: 'render',
      sortBy: this.storage.getItem('sortby') || 'latency',
      showFavorites: typeof browser == 'undefined' ? !!this.storage.getItem('showFavorites') : this.storage.getItem('showFavorites') === 'true',
    };

    // bindings
    this.syncRegions = this.syncRegions.bind(this);
    this.changeSortBy = this.changeSortBy.bind(this);
    this.onSearchUpdate = this.onSearchUpdate.bind(this);
    this.renderFavorite = this.renderFavorite.bind(this);
    this.toggleFavorites = this.toggleFavorites.bind(this);
  }

  onSearchUpdate({ target: { value } }) {
    this.setState({ search: value });
  }

  syncRegions() {
    this.setState({ mode: 'loading' });
    this.regionlist.sync().then(() => {
      this.setState({ mode: 'render', regions: this.regionlist.toArray() });
    });
  }

  changeSortBy(event) {
    const value = event.target.getAttribute('data-value');
    if (value === 'latency') { this.storage.setItem('sortby', 'latency'); }
    else { this.storage.setItem('sortby', 'name'); }
    this.setState({ sortBy: value });
  }

  toggleFavorites() {
    const favorite = typeof browser == 'undefined' ? this.storage.getItem('showFavorites') : this.storage.getItem('showFavorites') === 'true';
    this.storage.setItem('showFavorites', !favorite);
    this.setState({ showFavorites: !favorite });
  }

  renderFavorite() {
    const { showFavorites } = this.state;
    const heartUrl = showFavorites ? '/images/heart-full@3x.png' : '/images/heart-outline@3x.png';

    return (
      <div
        role="button"
        tabIndex="-1"
        className={`favorites heart-container noselect ${showFavorites ? 'active' : ''}`}
        onClick={this.toggleFavorites}
        onKeyPress={this.toggleFavorites}
      >
        <img alt="Favorite" className="heart" src={heartUrl} />
      </div>
    );
  }

  render() {
    const {
      mode,
      search,
      sortBy,
      showFavorites,
    } = this.state;
    const { context: { theme } } = this.props;
    const regions = this.regionlist.toArray();

    return (
      <div id="change-region-page" className={`row ${theme}`}>
        <PageTitle text={t('SelectRegionText')} />

        <RegionSearch theme={theme} search={search} onSearchUpdate={this.onSearchUpdate} />

        <div className={`region-sort-selection ${theme}`}>
          <button
            type="button"
            data-value="latency"
            onClick={this.changeSortBy}
            className={`latency ${sortBy === 'latency' ? 'active' : ''}`}
          >
            { t('RegionLatency') }
          </button>
          <button
            type="button"
            data-value="name"
            onClick={this.changeSortBy}
            className={`name ${sortBy === 'name' ? 'active' : ''}`}
          >
            { t('RegionName') }
          </button>


          { this.renderFavorite() }
        </div>

        <RegionList
          mode={mode}
          search={search}
          sortBy={sortBy}
          regions={regions}
          showFavorites={showFavorites}
          syncRegions={this.syncRegions}
        />
      </div>
    );
  }
}

ChangeRegionPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(ChangeRegionPage);
