import initRegionListItem from 'component/regionlistitem'
import onLoad from 'eventhandler/templates/changeregion/onload'

export default function(renderer, app, window, document) {
  const React          = renderer.react,
        RegionListItem = initRegionListItem(renderer, app, window, document),
        {regionlist,storage} = app.util

  return class extends React.Component {
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
        return(<div className="loader"></div>)
      }
      else {
        const regions   = this.state.regions,
              listItems = regions.map(region => (<RegionListItem key={region.id} region={region}/>))
        return (
          <ul id='region-list' className='list-group'>
            {listItems}
          </ul>
        )
      }
    }
  }
}
