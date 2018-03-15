import initRegionSorter from 'component/regionsorter'

export default function(renderer, app, window, document) {
  const React        = renderer.react,
        RegionSorter = initRegionSorter(renderer, app, window, document),
        storage      = app.util.storage

  class RegionViewToggles extends React.Component {
    constructor(props) {
      super(props)
      this.state = {activeToggleID: this.activeToggleID()}
    }

    activeToggleID() {
      switch(storage.getItem('regionview')) {
        case 'list':
          return '#list-icon'
        case 'grid':
          return '#grid-icon'
        default:
          return '#list-icon'
      }
    }

    componentDidMount() {
      const icon = document.querySelector(this.state.activeToggleID)
      icon.classList.add('active')
    }

    switchToListView() {
      storage.setItem('regionview', 'list')
      renderer.renderTemplate('change_region')
    }

    switchToGridView() {
      storage.setItem('regionview', 'grid')
      renderer.renderTemplate('change_region')
    }

    render() {
      return (
        <div className="row regionfilter">
          <div className="col-xs-9">
            <RegionSorter/>
          </div>
          <div className="col-xs-3">
            <div id="toggle-icon">
              <div id="list-icon" onClick={this.switchToListView.bind(this)}></div>
              <div id="grid-icon" onClick={this.switchToGridView.bind(this)}></div>
            </div>
          </div>
        </div>
      )
    }
  }

  return RegionViewToggles
}
