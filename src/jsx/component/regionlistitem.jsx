import NewRegionItem from "component/regionitem";

export default function(renderer, app, window, document) {
  const React = renderer.react;
  const RegionItem = NewRegionItem(renderer, app, window, document);
  const {regionlist,storage} = app.util;

  return class extends RegionItem {
    render() {
      const region     = this.state.region;
      const latencyDiv = this.renderLatency(region);
      const className  = regionlist.isSelectedRegion(region) ? "list-group-item list-group-item-action active" : "list-group-item list-group-item-action";
      const favorite = region.isFavorite ? (
        <img className="heart" src="/images/heart-full@2x.png" onClick={this.favorite.bind(this)} />
      ) : (
        <img className="heart" src="/images/heart-outline@2x.png" onClick={this.favorite.bind(this)} />
      );

      return (
        <a data-region-latency={region.latency} data-region-id={region.id} onClick={this.onClick.bind(this)} href="#" className={className}>
          {favorite}
          <img className="flag" onError={this.onFlagLoadError.bind(this)} src={region.flag} />
          <span className="regionnamelist">{region.localizedName()}</span>
          {latencyDiv}
        </a>
      )
    }

    favorite(e) {
      e.stopPropagation();
      let editedRegion = regionlist.setFavoriteRegion(this.state.region);
      this.setState(editedRegion);
    }

    renderLatency(region) {
      if(storage.getItem("sortby") === "latency") {
        if(region.offline) {
          return (<div className="list-item-latency server-offline-text">{t("OfflineText")}</div>);
        }
        else {
          const latency = Math.floor(region.latency);
          const klass = `list-item-latency ${this.latencyColor(latency)}`;
          return (<div className={klass}>{latency}ms</div>);
        }
      }
    }
  }
}
