import http from 'helpers/http';

class RegionList {
  constructor(app) {
    // bindings
    this.testHost = this.testHost.bind(this);
    this.testPort = this.testPort.bind(this);
    this.getPotentialHosts = this.getPotentialHosts.bind(this);
    this.getPotentialPorts = this.getPotentialPorts.bind(this);
    this.hasRegions = this.hasRegions.bind(this);
    this.toArray = this.toArray.bind(this);
    this.isSelectedRegion = this.isSelectedRegion.bind(this);
    this.getSelectedRegion = this.getSelectedRegion.bind(this);
    this.setSelectedRegion = this.setSelectedRegion.bind(this);
    this.sync = this.sync.bind(this);
    this.import = this.import.bind(this);
    this.export = this.export.bind(this);
    this.setFavoriteRegion = this.setFavoriteRegion.bind(this);

    // init
    this.app = app;
    this.synced = false;
    this.syncing = false;
    this.regionMap = new Map();
    chrome.alarms.create('PollRegionList', { delayInMinutes: 30, periodInMinutes: 30 });
  }

  /**
   * Test to see if the provided host is potentially used w/ active proxy
   *
   * @param {string} host The host to test
   */
  testHost(host) {
    return this.getPotentialHosts().includes(host);
  }

  /**
   * Test to see if the provided port is potentially used w/ active proxy
   *
   * @param {number} port The port to test
   */
  testPort(port) {
    return this.getPotentialPorts().includes(port);
  }

  getPotentialRegions() {
    let regions;
    const { util: { storage } } = this.app;
    const fromStorage = storage.getItem('region');
    const fromMemory = this.toArray();
    if (fromStorage) {
      const storageRegion = JSON.parse(fromStorage);
      const filtered = fromMemory.filter((r) => { return r.id !== storageRegion.id; });
      regions = [...filtered, storageRegion];
    }
    else {
      regions = fromMemory;
    }

    return regions;
  }

  /**
   * Get a list of hosts that are potentially being used for the active proxy connection
   */
  getPotentialHosts() {
    return this.getPotentialRegions()
      .map((r) => { return r.host; });
  }

  /**
   * Get a list of ports that are potentially being used for the active proxy connection
   */
  getPotentialPorts() {
    const { util: { settings } } = this.app;
    const key = settings.getItem('maceprotection') ? 'macePort' : 'port';

    return this.getPotentialRegions()
      .map((r) => { return r[key]; });
  }

  hasRegions() {
    return !!this.regionMap.size;
  }

  toArray() {
    return Array.from(this.regionMap.values());
  }

  isSelectedRegion(region) {
    return this.getSelectedRegion().id === region.id;
  }

  getSelectedRegion() {
    const { storage } = this.app.util;
    let selectedRegion;

    // check in memory
    selectedRegion = this.toArray().find((region) => { return region.active; });
    // check in storage
    if (!selectedRegion) {
      selectedRegion = Object.assign(
        {},
        JSON.parse(storage.getItem('region')),
        {
          localizedName() {
            return RegionList.createLocalizedName(selectedRegion.id, selectedRegion);
          },
        },
      );
    }

    return selectedRegion;
  }

  setSelectedRegion(id) {
    const {
      util: { storage },
    } = this.app;
    const region = this.regionMap.get(id);
    if (region) {
      this.toArray().forEach((currentRegion) => {
        const thisRegion = currentRegion;
        thisRegion.active = false;
      });
      region.active = true;
      storage.setItem('activeproxy', region.id);
      storage.setItem('region', JSON.stringify(region));
    }
  }

  async sync() {
    const {
      util: { storage, bypasslist },
    } = this.app;
    this.syncing = true;
    let favoriteRegions = storage.getItem('favoriteregions');
    if (favoriteRegions) { favoriteRegions = favoriteRegions.split(','); }
    else { favoriteRegions = []; }
    RegionList.debug('start sync');
    try {
      const response = await http.get(
        'https://www.privateinternetaccess.com/api/client/services/https',
        { timeout: 5000 },
      );
      this.regionMap.clear();
      const json = await response.json();
      Object.keys(json).forEach((regionID) => {
        const region = RegionList.createRegion(regionID, json[regionID]);
        if (favoriteRegions.includes(regionID)) { region.isFavorite = true; }
        this.regionMap.set(regionID, region);
      });
      this.setSelectedRegion(storage.getItem('activeproxy') || RegionList.defaultRegionID);
      this.syncing = false;
      this.synced = true;
      bypasslist.updatePingGateways();
      RegionList.debug('sync ok');

      return response;
    }
    catch (err) {
      this.syncing = false;
      this.synced = false;
      RegionList.debug('sync error', err);
      return err;
    }
  }

  import(regions) {
    if (!regions || !Array.isArray(regions)) { return; }
    this.regionMap.clear();
    regions.forEach((region) => {
      const newRegion = RegionList.createRegion(region.id, region);
      this.regionMap.set(region.id, newRegion);
    });
    this.syncing = false;
    this.synced = true;
    this.app.util.bypasslist.updatePingGateways();
  }

  export() {
    return Array.from(this.regionMap.values())
      .map((region) => {
        return {
          id: region.id,
          name: region.name,
          iso: region.iso,
          dns: region.host,
          port: region.port,
          mace: region.macePort,
        };
      });
  }

  /**
   * Toggle whether or not the provided region is favorited
   *
   * @param {*|string} region Provided region to toggle
   */
  setFavoriteRegion(region) {
    const {
      util: { storage },
    } = this.app;

    // Get regionID
    let regionID = '';
    if (typeof region === 'string') { regionID = region; }
    else { regionID = region.id; }

    // Determine current value of isFavorite
    let isFavorite = false;
    const memRegion = this.toArray().find((r) => { return r.id === regionID; });
    ({ isFavorite } = memRegion);

    // get current favorite regions from storage
    let currentFavs = storage.getItem('favoriteregions');
    if (currentFavs) { currentFavs = currentFavs.split(','); }
    else { currentFavs = []; }

    // update favorite regions in storage
    if (!isFavorite) {
      currentFavs.push(regionID);
      const favs = [...new Set(currentFavs)];
      storage.setItem('favoriteregions', favs.join(','));
    }
    else {
      currentFavs = currentFavs.filter((fav) => { return fav !== regionID; });
      storage.setItem('favoriteregions', currentFavs.join(','));
    }

    // Update in memory region
    memRegion.isFavorite = !memRegion.isFavorite;

    return region;
  }

  static createLocalizedName(regionID, region) {
    const name = t(regionID);
    return name.length > 0 ? name : region.name;
  }

  static createRegion(regionID, region) {
    return {
      scheme: 'https',
      id: regionID,
      name: region.name,
      iso: region.iso,
      host: region.dns,
      port: region.port,
      macePort: region.mace,
      flag: `/images/flags/${region.iso}_icon_64.png`,
      active: false,
      latency: 0,
      offline: false,
      isFavorite: false,
      localizedName() {
        return RegionList.createLocalizedName(regionID, region);
      },
    };
  }

  static get defaultRegionID() {
    return 'us_new_york_city';
  }

  static debug(msg, err) {
    const debugMsg = `regionlist.js: ${msg}`;
    debug(debugMsg);
    if (err) {
      const errMsg = `regionlist.js error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`;
      debug(errMsg);
    }
    return new Error(debugMsg);
  }
}

export default RegionList;
