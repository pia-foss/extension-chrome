export default function(renderer, app, component) {
  const {regionsorter} = app.util

  this.sortRegions = (sortMethod, regions) => {
    switch(sortMethod) {
    case "name":
      regionsorter.nameSort(regions).then((regions) => {
        if(component.mounted)
          component.setState({regions})
      })
      break
    case "latency":
      regionsorter.latencySort(regions).then((regions) => {
        if(component.mounted)
          component.setState({regions})
      })
      break
    default:
      regionsorter.nameSort(regions).then((regions) => {
        if(component.mounted)
          component.setState({regions})
      })
      break
    }
  }

  return this
}
