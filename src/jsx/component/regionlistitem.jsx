import NewRegionItem from "component/regionitem"

export default function(renderer, app, window, document) {
  const React = renderer.react,
        RegionItem = NewRegionItem(renderer, app, window, document),
        {regionlist,storage} = app.util

  return class extends RegionItem {
    render() {
      const region     = this.state.region,
            latencyDiv = this.renderLatency(region),
            className  = regionlist.isSelectedRegion(region) ? "list-group-item list-group-item-action active" : "list-group-item list-group-item-action"
      return (
        <a data-region-latency={region.latency} data-region-id={region.id} onClick={this.onClick.bind(this)} href="#" className={className}>
          <img className="flag" onError={this.onFlagLoadError.bind(this)} src={region.flag}/>
          <span className="regionnamelist">{region.localizedName()}</span>
          {latencyDiv}
        </a>
      )
    }

    renderLatency(region) {
      if(storage.getItem("sortby") === "latency") {
        if(region.offline) {
          return (<div className="list-item-latency server-offline-text">{t("OfflineText")}</div>)
        }
        else {
          const latency = Math.floor(region.latency),
                klass = `list-item-latency ${this.latencyColor(latency)}`
          return (<div className={klass}>{latency}ms</div>)
        }
      }
    }
  }
}
