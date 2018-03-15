import initRegionGrid  from 'component/regiongrid'
import initRegionList  from 'component/regionlist'
import initPageTitle    from 'component/pagetitle'

export default function(renderer, app, window, document) {
  const React        = renderer.react,
        RegionGrid   = initRegionGrid(renderer, app, window, document),
        RegionList   = initRegionList(renderer, app, window, document),
        PageTitle    = initPageTitle(renderer, app, window, document),
        storage      = app.util.storage

  class ChangeRegionTemplate extends React.Component {
    render() {
      return(
        <div className="row" id="change-region-template">
          <div className="top-border">
            <div>
              <PageTitle previousTemplate="authenticated" text={t("SelectRegionText")}/>
            </div>
            <div id="regions">
              {this.regions()}
            </div>
          </div>
        </div>
      )
    }

    regions() {
      switch(storage.getItem('regionview')) {
        case 'list':
          return (<RegionList/>)
        case 'grid':
          return (<RegionGrid/>)
        default:
          return (<RegionList/>)
      }
    }
  }

  return ChangeRegionTemplate
}
