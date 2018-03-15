import initRegionGridItem  from 'component/regiongriditem'
import onLoad from 'eventhandler/templates/changeregion/onload'

export default function(renderer, app, window, document) {
  const React  = renderer.react,
        {regionlist,storage} = app.util,
        RegionGridItem  = initRegionGridItem(renderer, app),
        createGrid = (regions, perRow) => {
          const grid = []
          regions.forEach((region, index) => {
            index % perRow === 0 && grid.push([])
            grid[grid.length-1].push(<RegionGridItem key={region.id} region={region}/>)
          })
          return grid.map((gridItems, index) =>{
            return (<div className="row regionrow" key={index}>{gridItems}</div>)
          })
        }

  class RegionGrid extends React.Component {
    constructor(props) {
      super(props)
      this.state = {regions: []}
    }

    componentDidUpdate() {
      document.querySelector("div#regions .active").scrollIntoView()
    }

    componentDidMount() {
      new onLoad(renderer, app, this).sortRegions(storage.getItem("sortby"), regionlist.toArray())
      this.mounted = true
    }

    componentWillUnmount() {
      this.mounted = false
    }

    render() {
      if(this.state.regions.length === 0) {
        return (<div className="loader"></div>)
      }
      else {
        const regions = this.state.regions,
              grid    = createGrid(regions, 2)
        return (<div id='region-grid'>{grid}</div>)
      }
    }
  }

  return RegionGrid
}
