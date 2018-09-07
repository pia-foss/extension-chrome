import React, { Component } from 'react';
import initRegionGrid from '../component/regiongrid';
import initRegionList from '../component/regionlist';
import initPageTitle from '../component/pagetitle';
import OfflineWarning from '../component/OfflineWarning';

export default function (renderer, app, window, document) {
  const RegionGrid = initRegionGrid(renderer, app, window, document);
  const RegionList = initRegionList(renderer, app, window, document);
  const PageTitle = initPageTitle(renderer, app, window, document);

  class ChangeRegionTemplate extends Component {
    constructor(props) {
      super(props);

      // properties
      this.storage = app.util.storage;
      this.state = { showFavorites: this.storage.getItem('showfavorites') === 'true' };

      // Pull showFavorites from storage
      this.showAllRegions = this.showAllRegions.bind(this);
      this.showFavoriteRegions = this.showFavoriteRegions.bind(this);
    }

    regions() {
      const { showFavorites } = this.state;
      switch (this.storage.getItem('regionview')) {
        case 'list':
          return (<RegionList showFavorites={showFavorites} />);
        case 'grid':
          return (<RegionGrid showFavorites={showFavorites} />);
        default:
          return (<RegionList showFavorites={showFavorites} />);
      }
    }

    showAllRegions() {
      this.storage.setItem('showfavorites', false);
      this.setState({ showFavorites: false });
    }

    showFavoriteRegions() {
      this.storage.setItem('showfavorites', true);
      this.setState({ showFavorites: true });
    }

    render() {
      const { showFavorites } = this.state;
      return (
        <div className="row" id="change-region-template">
          <OfflineWarning />

          <div className="top-border">
            <div>
              <PageTitle previousTemplate="authenticated" text={t('SelectRegionText')} />
            </div>

            <div className="favorite-region-selector">
              <button type="button" onClick={this.showAllRegions} className={showFavorites ? '' : 'active'}>
                { t('AllRegions') }
              </button>

              <button type="button" onClick={this.showFavoriteRegions} className={showFavorites ? 'active' : ''}>
                { t('FavoriteRegions') }
              </button>
            </div>
            <div id="regions">
              { this.regions() }
            </div>
          </div>
        </div>
      );
    }
  }

  return ChangeRegionTemplate;
}
