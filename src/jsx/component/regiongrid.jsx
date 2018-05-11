import initRegionGridItem  from 'component/regiongriditem';
import onLoad from 'eventhandler/templates/changeregion/onload';

export default function(renderer, app, window, document) {
  const React  = renderer.react;
  const {regionlist,storage} = app.util;
  const RegionGridItem  = initRegionGridItem(renderer, app);

  class RegionGrid extends React.Component {
    constructor(props) {
      super(props);
      this.state = {regions: []};
      this.createGrid = this.createGrid.bind(this);
    }

    componentDidUpdate() {
      let active = document.querySelector("div#regions .active");
      if (active) { active.scrollIntoView(); }
    }

    componentDidMount() {
      new onLoad(renderer, app, this).sortRegions(storage.getItem("sortby"), regionlist.toArray());
      this.mounted = true;
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    createGrid(perRow) {
      const grid = [];
      // handle favorites
      this.state.regions.filter((region) => {
        if (this.props.showFavorites) { return region.isFavorite; }
        else { return true; }
      })
      .forEach((region, index) => {
        index % perRow === 0 && grid.push([]);
        grid[grid.length-1].push(<RegionGridItem key={region.id} region={region}/>);
      });
      return grid.map((gridItems, index) =>{
        return (<div className="row regionrow" key={index}>{gridItems}</div>);
      });
    }

    render() {
      if(this.state.regions.length === 0) {
        return (<div className="loader"></div>);
      }
      else {
        return (<div id='region-grid'>{this.createGrid(2)}</div>);
      }
    }
  }

  return RegionGrid;
}
