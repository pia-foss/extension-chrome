import initRegionGrid  from 'component/regiongrid';
import initRegionList  from 'component/regionlist';
import initPageTitle    from 'component/pagetitle';

export default function(renderer, app, window, document) {
  const React        = renderer.react;
  const RegionGrid   = initRegionGrid(renderer, app, window, document);
  const RegionList   = initRegionList(renderer, app, window, document);
  const PageTitle    = initPageTitle(renderer, app, window, document);
  const storage      = app.util.storage;

  class ChangeRegionTemplate extends React.Component {
    constructor(props) {
      super(props);

      // Pull showFavorites from storage
      this.state = {showFavorites: storage.getItem('showfavorites') === 'true'};
      this.showAllRegions = this.showAllRegions.bind(this);
      this.showFavoriteRegions = this.showFavoriteRegions.bind(this);
    }

    render() {
      return(
        <div className="row" id="change-region-template">
          <div className="top-border">
            <div>
              <PageTitle previousTemplate="authenticated" text={t("SelectRegionText")}/>
            </div>
            <div className="favorite-region-selector">
              <button onClick={this.showAllRegions} className={this.state.showFavorites ? '' : 'active'}>
                {t("AllRegions")}
              </button>

              <button onClick={this.showFavoriteRegions} className={this.state.showFavorites ? 'active' : ''}>
                {t("FavoriteRegions")}
              </button>
            </div>
            <div id="regions">
              {this.regions()}
            </div>
          </div>
        </div>
      );
    }

    regions() {
      switch(storage.getItem('regionview')) {
        case 'list':
          return (<RegionList showFavorites={this.state.showFavorites}/>);
        case 'grid':
          return (<RegionGrid showFavorites={this.state.showFavorites}/>);
        default:
          return (<RegionList showFavorites={this.state.showFavorites}/>);
      }
    }

    showAllRegions() {
      storage.setItem('showfavorites', false);
      this.setState({showFavorites: false});
    }

    showFavoriteRegions() {
      storage.setItem('showfavorites', true);
      this.setState({showFavorites: true});
    }
  }


  return ChangeRegionTemplate;
}
