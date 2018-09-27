import React, { Component } from 'react';
import RegionGrid from '../component/RegionGrid';
import RegionList from '../component/RegionList';
import PageTitle from '../component/PageTitle';
import OfflineWarning from '../component/OfflineWarning';
import RegionViewToggle from '../component/RegionViewToggle';

export default function () {
  return class ChangeRegionTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.app = background.app;

      // properties
      this.storage = this.app.util.storage;
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

            <RegionViewToggle />

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
  };
}
