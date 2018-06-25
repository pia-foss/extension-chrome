import tinyhttp from "tinyhttp";

export default function(app) {
  const self = Object.create(null);
  const http = tinyhttp("https://www.privateinternetaccess.com");
  const {storage} = app.util;
  const defaultRegionID  = "us_new_york_city";
  const regionMap = new Map();

  const createLocalizedName = (regionID, region) => {
    const name = t(regionID);
    return name.length > 0 ? name : region.name;
  };

  const createRegion = (regionID, region) => {
    return {
      scheme:        "https",
      id:            regionID,
      name:          region.name,
      localizedName: () => createLocalizedName(regionID, region),
      iso:           region.iso,
      host:          region.dns,
      port:          region.port,
      macePort:      region.mace,
      flag:          `/images/flags/${region.iso}_64.png`,
      active:        false,
      latency:       0,
      offline:       false,
      isFavorite:    false
    };
  };

  self.synced  = false;
  self.syncing = false;

  self.toArray = () => {
    return Array.from(regionMap.values());
  }

  self.isSelectedRegion = (region) => {
    return self.getSelectedRegion().id === region.id;
  }

  /*
    we keep an on-disk copy of the last selected region,
    incase this method is called when the region list has
    not synced.
  */
  self.getSelectedRegion = () => {
    const fromMemory  = self.toArray().find(region => region.active);
    const fromStorage = storage.getItem("region");
    if(fromMemory) { return fromMemory; }
    if(fromStorage) {
      const region = JSON.parse(fromStorage);
      region.localizedName = () => createLocalizedName(region.id, region);
      return region;
    }
  }

  self.setSelectedRegion = (id) => {
    const region = regionMap.get(id);
    if(region) {
      self.toArray().forEach(_region => _region.active = false);
      region.active = true;
      storage.setItem("activeproxy", region.id);
      storage.setItem("region", JSON.stringify(region));
    }
  }

  self.sync = () => {
    self.syncing = true;
    let favoriteRegions = storage.getItem('favoriteregions');
    if (favoriteRegions) { favoriteRegions = favoriteRegions.split(','); }
    else { favoriteRegions = []; }

    debug(`regionlist.js: start sync`);
    return http.get("/api/client/services/https", {timeout: 5000}).then((xhr) => {
      regionMap.clear();
      const res = JSON.parse(xhr.response);
      for(let regionID in res) {
        let region = createRegion(regionID, res[regionID]);
        if (favoriteRegions.includes(regionID)) { region.isFavorite = true; }
        regionMap.set(regionID, region);
      }
      self.setSelectedRegion(storage.getItem("activeproxy") || defaultRegionID);
      self.syncing = false;
      self.synced = true;
      app.util.bypasslist.updatePingGateways();
      debug("regionlist.js: sync ok");
      return xhr;
    })
    .catch((xhr) => {
      self.syncing = false;
      self.synced = false;
      debug(`regionlist.js: sync error (${xhr.tinyhttp.cause})`);
      return xhr;
    });
  }

  self.setFavoriteRegion = (region) => {
    let currentFavs = storage.getItem('favoriteregions');
    if (currentFavs) { currentFavs = currentFavs.split(','); }
    else { currentFavs = []; }

    if (!region.isFavorite) {
      currentFavs.push(region.id);
      let favs = [...new Set(currentFavs)];
      storage.setItem('favoriteregions', favs.join(','));
    }
    else {
      currentFavs = currentFavs.filter((fav) => { return fav !== region.id; });
      storage.setItem('favoriteregions', currentFavs.join(','));
    }

    // update in memory region
    let memRegion = self.toArray().find(r => r.id === region.id);
    memRegion.isFavorite = !memRegion.isFavorite;
    return region;
  }

  chrome.alarms.create("PollRegionList", {delayInMinutes: 30, periodInMinutes: 30});

  return self;
}
