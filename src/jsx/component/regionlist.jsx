import initRegionListItem from 'component/regionlistitem';
import onLoad from 'eventhandler/templates/changeregion/onload';

export default function(renderer, app, window, document) {
  const React = renderer.react;
  const RegionListItem = initRegionListItem(renderer, app, window, document);
  const {regionlist,storage} = app.util;

  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {regions: []};
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

    render() {
      if(this.state.regions.length === 0) {
        return(<div className="loader"></div>);
      }
      else {
        const listItems = this.state.regions
        .map(region => (<RegionListItem key={region.id} region={region}/>))
        .filter(region => {
          if (this.props.showFavorites) { return region.props.region.isFavorite; }
          else { return true; }
        });
        return (
          <ul id='region-list' className='list-group'>
            {listItems}
          </ul>
        );
      }
    }
  }
}
