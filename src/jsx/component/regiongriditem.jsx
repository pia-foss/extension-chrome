import NewRegionItem from "component/regionitem";

export default function(renderer, app, window, document) {
  const React = renderer.react;
  const RegionItem = NewRegionItem(renderer, app, window, document);
  const {regionlist,storage} = app.util;

  return class extends RegionItem {
    render() {
      const region     = this.state.region;
      const latencyDiv = this.renderLatency(region);
      const className  = regionlist.isSelectedRegion(region) ? "col-xs-6 regionbox active" : "col-xs-6 regionbox";
      const favorite = region.isFavorite ? (
        <img className="heart" src="/images/heart-full@2x.png" onClick={this.favorite.bind(this)} />
      ) : (
        <img className="heart" src="/images/heart-outline@2x.png" onClick={this.favorite.bind(this)} />
      );

      return (
        <div data-region-latency={region.latency} data-region-id={region.id} className={className} onClick={this.onClick.bind(this)}>
          <div className="regionwrapper">
            {favorite}
            <div className='col-xs-12 flag text-center'><img src={region.flag} onError={this.onFlagLoadError.bind(this)}/></div>
            <div className='col-xs-12 name text-center'>{region.localizedName()}</div>
            {latencyDiv}
          </div>
        </div>
      );
    }

    favorite(e) {
      e.stopPropagation();
      let editedRegion = regionlist.setFavoriteRegion(this.state.region);
      this.setState(editedRegion);
    }

    renderLatency(region) {
      if(storage.getItem("sortby") === "latency") {
        if(region.offline) {
          return (<div className="col-xs-12 text-center server-offline-text">{t("OfflineText")}</div>);
        }
        else {
          const latency = Math.floor(region.latency);
          const klass   = `col-xs-12 text-center grid-item-latency ${this.latencyColor(latency)}`;
          return (<div className={klass}>{latency}ms</div>);
        }
      }
    }
  }
}
