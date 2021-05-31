import http from "@helpers/http";
import { Type } from "@helpers/messagingFirefox";

const defaultRegions = require("../data/regions.json");

const FAVORITE_REGIONS_KEY = "favoriteregions";
const OVERRIDE_KEY = "regionlist::override";

class RegionList {
  constructor(app, foreground) {
    // bindings
    this.testHost = this.testHost.bind(this);
    this.testPort = this.testPort.bind(this);
    this.getPotentialRegions = this.getPotentialRegions.bind(this);
    this.getPort = this.getPort.bind(this);
    this.getPotentialHosts = this.getPotentialHosts.bind(this);
    this.getPotentialPorts = this.getPotentialPorts.bind(this);
    this.initialOverrideRegions = this.initialOverrideRegions.bind(this);
    this.addOverrideRegion = this.addOverrideRegion.bind(this);
    this.updateOverrideRegion = this.updateOverrideRegion.bind(this);
    this.removeOverrideRegion = this.removeOverrideRegion.bind(this);
    this.getOverrideArray = this.getOverrideArray.bind(this);
    this.updateRegion = this.updateRegion.bind(this);
    this.export = this.export.bind(this);
    this.import = this.import.bind(this);
    this.getRegion = this.getRegion.bind(this);
    this.hasRegions = this.hasRegions.bind(this);
    this.hasRegion = this.hasRegion.bind(this);
    this.getIsAuto = this.getIsAuto.bind(this);
    this.setIsAuto = this.setIsAuto.bind(this);
    this.getFastestRegion = this.getFastestRegion.bind(this);
    this.getAutoRegion = this.getAutoRegion.bind(this);
    this.setAutoRegion = this.setAutoRegion.bind(this);
    this.getRegions = this.getRegions.bind(this);
    this.toArray = this.toArray.bind(this);
    this.isSelectedRegion = this.isSelectedRegion.bind(this);
    this.getSelectedRegion = this.getSelectedRegion.bind(this);
    this.getRegionFromStorage = this.getRegionFromStorage.bind(this);
    this.importAutoRegion = this.importAutoRegion.bind(this);
    this.setSelectedRegion = this.setSelectedRegion.bind(this);
    this.sync = this.sync.bind(this);
    this.setFavoriteRegion = this.setFavoriteRegion.bind(this);
    this.setDefaultRegions = this.setDefaultRegions.bind(this);
    this.getRegionById = this.getRegionById.bind(this);
    this.exportAutoRegion = this.exportAutoRegion.bind(this);
    // init
    this.app = app;
    this.foreground = foreground;
    this.selectedRegionSmartLoc = null;
    this.storage = this.app.util.storage;
    this.normalRegions = {};
    this.overrideRegions = this.initialOverrideRegions(this.storage);
    this.defaultRegions = defaultRegions;

    // set isAuto property based on storage
    const isAuto = !!this.app.util.storage.getItem("autoRegion");
    const region = this.app.util.storage.getItem("region");

    if (isAuto === "true") {
      this.isAuto = true;
    } else if (!isAuto && !region) {
      this.isAuto = true;
    } else {
      this.isAuto = false;
    }

    // poll for new regions every 60 minutes
    this.setDefaultRegions();
    chrome.alarms.create("PollRegionList", {
      delayInMinutes: 30,
      periodInMinutes: 60,
    });
  }

  setDefaultRegions() {
    const {
      util: { storage },
    } = this.app;

    // keep track of current favorite regions
    let favoriteRegions = storage.getItem("favoriteregions");
    if (favoriteRegions) {
      favoriteRegions = favoriteRegions.split(",");
    } else {
      favoriteRegions = [];
    }

    // clear current region data
    this.normalRegions = {};

    // replace with new data from server
    defaultRegions.map((reg) => {
      const region = RegionList.createNormalRegion(reg.name, reg);
      if (favoriteRegions.includes(region.id)) {
        region.isFavorite = true;
      }
      this.normalRegions[region.id] = region;
    });
  }

  // ---------------------- Auth Tests --------------------- //

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
    const {
      util: { storage },
    } = this.app;
    const fromStorage = storage.getItem("region");
    const fromMemory = this.getRegions();
    if (fromStorage) {
      const storageRegion = JSON.parse(fromStorage);
      regions = Object.assign({}, fromMemory, {
        [storageRegion.id]: storageRegion,
      });
    } else {
      regions = fromMemory;
    }

    return Object.values(regions);
  }

  // ------------------------ Firefox ------------------------- //
  // ---------------------------------------------------------- //
  //    The following methods are used by the mockApp system    //
  // ---------------------------------------------------------- //

  importAutoRegion(autoRegion) {
    if (!autoRegion) {
      return;
    }
    this.setAutoRegion(
      RegionList.createNormalRegion(autoRegion.id, autoRegion),
      true
    );
  }

  import(regions) {
    if (!regions || !Array.isArray(regions)) {
      return;
    }
    regions.forEach((region) => {
      this.updateRegion(RegionList.localize(region));
    });
    this.app.util.bypasslist.updatePingGateways();
  }

  export() {
    // Important to use ALL regions (override regions will override normal regions in toArray)
    return [
      ...Object.values(this.overrideRegions),
      ...Object.values(this.normalRegions),
    ].map((region) => {
      // strip non-serializable properties
      return JSON.parse(JSON.stringify(region));
    });
  }

  exportAutoRegion() {
    if (!this.autoRegion) {
      return undefined;
    }
    return {
      id: this.autoRegion.id,
      ping: this.autoRegion.ping,
      name: this.autoRegion.name,
      iso: this.autoRegion.iso,
      dns: this.autoRegion.host,
      port: this.autoRegion.port,
      macePort: this.autoRegion.macePort,
      latency: this.autoRegion.latency,
    };
  }

  resetFavoriteRegions(regions) {
    const {
      util: { storage },
    } = this.app;
    storage.setItem(FAVORITE_REGIONS_KEY, regions);

    if (regions) {
      regions.split(",").forEach((region) => {
        const memRegion = this.getRegion(region.id);
        if (memRegion) {
          this.updateRegion(
            Object.assign({}, memRegion, { isFavorite: !memRegion.isFavorite })
          );
        }
      });
    }
  }

  // -------------------- Static ----------------------- //

  /**
   * Get a list of hosts that are potentially being used for the active proxy connection
   */
  getPotentialHosts() {
    return this.getPotentialRegions().map((r) => {
      return r.host;
    });
  }

  /**
   * Get a list of ports that are potentially being used for the active proxy connection
   */
  getPotentialPorts() {
    const {
      util: { settings },
    } = this.app;
    const key = settings.getItem("maceprotection") ? "macePort" : "port";

    return this.getPotentialRegions().map((r) => {
      return r[key];
    });
  }

  // -------------------- Override Regions ----------------------- //

  initialOverrideRegions() {
    let overrideRegions;
    const fromStorage = this.storage.getItem(OVERRIDE_KEY);
    if (fromStorage) {
      overrideRegions = {};
      const fromStorageMap =
        typeof fromStorage == "string" ? JSON.parse(fromStorage) : fromStorage;
      Object.keys(fromStorageMap).forEach((id) => {
        overrideRegions[id] = RegionList.localize(fromStorageMap[id]);
      });
    } else {
      overrideRegions = {};
      this.storage.setItem(OVERRIDE_KEY, JSON.stringify(overrideRegions));
    }
    return overrideRegions;
  }

  /**
   * Add a new override region
   */
  addOverrideRegion({ name, host, port }, stopPropagation) {
    const {
      app: { adapter },
    } = this;
    try {
      const region = RegionList.createOverrideRegion({ name, host, port });
      this.updateOverrideRegion(region);
      if (!stopPropagation && typeof browser != "undefined") {
        adapter.sendMessage(Type.ADD_OVERRIDE_REGION, { name, host, port });
      }
    } catch (err) {
      const msg = err.message || err;
      debug(msg);
      throw err;
    }
  }

  updateOverrideRegion(region) {
    if (!region.override || !region.id) {
      throw new Error("invalid region");
    }
    this.overrideRegions[region.id] = region;
    this.storage.setItem(OVERRIDE_KEY, JSON.stringify(this.overrideRegions));
  }

  /**
   * Remove an existing override region by name
   */
  removeOverrideRegion(name, stopPropagation) {
    const {
      app: { adapter },
    } = this;
    let wasSelected = false;
    const id = RegionList.createOverrideID(name);
    const region = this.overrideRegions[id];
    delete this.overrideRegions[id];
    if (region && region.active) {
      wasSelected = true;
      let toSelect = this.getFastestRegion();
      if (!toSelect) {
        [toSelect] = this.getRegions();
      }
      if (toSelect) {
        this.setSelectedRegion(this.getFastestRegion().id);
      }
    }
    this.storage.setItem(OVERRIDE_KEY, JSON.stringify(this.overrideRegions));
    if (!stopPropagation && typeof browser != "undefined") {
      adapter.sendMessage(Type.REMOVE_OVERRIDE_REGION, name);
    }

    return wasSelected;
  }

  /**
   * Retrieve an array of override regions
   */
  getOverrideArray() {
    return Object.values(this.overrideRegions);
  }

  // --------------------- General ---------------------- //

  updateRegion(region) {
    if (region.override) {
      this.updateOverrideRegion(region);
    } else {
      this.normalRegions[region.id] = region;
    }
  }

  getRegion(id) {
    return this.getRegions()[id];
  }

  getPort() {
    const {
      util: { settings },
    } = app;
    const key = settings.getItem("maceprotection") ? "macePort" : "port";
    return key;
  }

  /**
   * Returns whether there are regions in memory
   */
  hasRegions() {
    return !!this.toArray().length;
  }

  hasRegion(id) {
    return !!this.getRegion(id);
  }

  /**
   * Returns the isAuto flag, this determines whether the extension is in 'auto' mode
   */
  getIsAuto() {
    return this.isAuto;
  }

  /**
   * Sets the given value to isAuto and saves that value to storage
   */
  setIsAuto(value) {
    this.isAuto = value;
    this.app.util.storage.setItem("autoRegion", value);
  }

  /**
   * Calculates the fastest region given current latency times.
   * Can return undefined if no regions exists.
   */
  getFastestRegion() {
    if (!this.hasRegions()) {
      return undefined;
    }
    const regions = this.toArray();
    const { regionsorter } = this.app.util;
    const sorted = regionsorter.latencySort(regions);
    return sorted[0];
  }

  /**
   * Returns the 'auto' region, the fastest region based on latency
   */
  getAutoRegion() {
    this.setAutoRegion(this.getFastestRegion());
    return this.autoRegion;
  }

  /**
   * Sets autoRegion to an immutable copy of given region value.
   */
  setAutoRegion(region, stopPropagation) {
    this.autoRegion = Object.assign({}, region);
    const { adapter } = this.app;
    if (!stopPropagation && typeof browser != "undefined") {
      adapter.sendMessage(Type.IMPORT_AUTO_REGION, this.exportAutoRegion());
    }
  }

  getRegions() {
    return Object.assign({}, this.normalRegions, this.overrideRegions);
  }

  /**
   * Iterates through the regionMap and sets the active property to false for all regions.
   */
  clearActive() {
    this.toArray().forEach((currentRegion) => {
      const thisRegion = currentRegion;
      thisRegion.active = false;
    });
  }

  toArray() {
    return Object.values(this.getRegions());
  }

  isSelectedRegion(region) {
    if (!this.getSelectedRegion()) {
      return false;
    }
    return this.getSelectedRegion().id === region.id;
  }

  /*
    NOTE: we keep an on-disk copy of the last selected region,
    incase this method is called when the region list has
    not synced.
  */

  getRegionById(id) {
    if (id) {
      return Object.values(this.getRegions()).filter((v) => v.id === id)[0];
    }
  }

  getSelectedRegion() {
    let selectedRegion;
    let storageRegion;

    // check if auto region is used
    if (this.getIsAuto()) {
      selectedRegion = this.getAutoRegion();
    }

    // look for active region in memory
    if (!selectedRegion) {
      selectedRegion = this.toArray().find((region) => {
        return region.active;
      });
    }

    // look for active region in storage
    if (!selectedRegion) {
      storageRegion = this.storage.getItem("region");
    }
    if (!selectedRegion && storageRegion) {
      try {
        selectedRegion = RegionList.localize(JSON.parse(storageRegion));
      } catch (_) {
        /* noop */
      }
    }

    const region = this.selectedRegionSmartLoc
      ? Object.values(this.getRegions()).filter(
          (v) => v.id === this.selectedRegionSmartLoc.id
        )
      : [];
    selectedRegion = region.length > 0 ? region[0] : selectedRegion;
    // selectedRegion can be undefined if there are no regions

    return selectedRegion;
  }

  getRegionFromStorage() {
    let selectedRegion;
    let storageRegion;

    // check if auto region is used
    if (this.getIsAuto()) {
      selectedRegion = this.getAutoRegion();
    }

    // look for active region in memory
    if (!selectedRegion) {
      selectedRegion = this.toArray().find((region) => {
        return region.active;
      });
    }

    // look for active region in storage
    if (!selectedRegion) {
      storageRegion = this.storage.getItem("region");
    }

    if (!selectedRegion && storageRegion) {
      try {
        selectedRegion = RegionList.localize(storageRegion);
      } catch (_) {
        /* noop */
      }
    }
    return selectedRegion;
  }

  setSelectedRegion(id, stopPropagation) {
    let selectedRegion;
    const clearRegion = (r) => {
      this.updateRegion(Object.assign({}, r, { active: false }));
    };
    const activeRegions = this.toArray().filter((r) => {
      return r.active;
    });
    activeRegions.forEach(clearRegion);

    if (id === "auto") {
      this.setIsAuto(true);
      selectedRegion = this.getAutoRegion();
    } else {
      this.setIsAuto(false);
      selectedRegion = this.getRegion(id);
      if (!selectedRegion) {
        throw new Error(`no such region with id ${id}`);
      }

      // Set new region active
      this.updateRegion(Object.assign({}, selectedRegion, { active: true }));
    }

    this.storage.setItem("region", JSON.stringify(selectedRegion));
    if (!stopPropagation && typeof browser != "undefined") {
      this.app.adapter.sendMessage(Type.SET_SELECTED_REGION, { id });
    }
  }

  async sync() {
    const {
      courier,
      util: { storage, bypasslist, latencymanager },
    } = this.app;

    // keep track of current favorite regions
    let favoriteRegions = storage.getItem("favoriteregions");
    if (favoriteRegions) {
      favoriteRegions = favoriteRegions.split(",");
    } else {
      favoriteRegions = [];
    }

    RegionList.debug("start sync");

    try {
      // get latest regions from server
      const url = "https://serverlist.piaservers.net/proxy";
      const response = await http.get(url, { timeout: 5000 });
      const json = await response.json();

      // clear current region data
      this.normalRegions = {};

      // replace with new data from server
      json.map((reg) => {
        const region = RegionList.createNormalRegion(reg.name, reg);
        if (favoriteRegions.includes(region.id)) {
          region.isFavorite = true;
        }
        this.normalRegions[region.id] = region;
      });


      // update bypasslist with new dns records
      bypasslist.updatePingGateways();

      // update region latency
      await latencymanager.run();

      // set new auto region
      this.setAutoRegion(this.getFastestRegion());

      // if auto mode and proxy is on, just connect to the new auto region
      if (this.getIsAuto() && this.app.proxy.enabled()) {
        await this.app.proxy.enable();
      }

      courier.sendMessage("refresh");

      RegionList.debug("sync ok");
      return response;
    } catch (err) {
      RegionList.debug("sync error", err);
      return err;
    }
  }

  /**
   * Toggle whether or not the provided region is favorited
   *
   * @param {*|string} region Provided region to toggle
   */
  setFavoriteRegion(region, bridged) {
    const {
      util: { storage },
      adapter,
    } = this.app;
    // Get regionID
    let regionID = "";
    if (typeof region === "string") {
      regionID = region;
    } else {
      regionID = region.id;
    }

    // alert background page if not bridged
    if (!bridged && typeof browser != "undefined") {
      adapter.sendMessage(Type.SET_FAVORITE_REGION, regionID);
    }

    // Determine current value of isFavorite
    let isFavorite = false;
    const memRegion = this.toArray().find((r) => {
      return r.id === regionID;
    });
    ({ isFavorite } = memRegion);

    // get current favorite regions from storage
    let currentFavs = storage.getItem("favoriteregions");
    if (currentFavs) {
      currentFavs = currentFavs.split(",");
    } else {
      currentFavs = [];
    }

    // update favorite regions in storage
    if (!isFavorite) {
      currentFavs.push(regionID);
      const favs = [...new Set(currentFavs)];
      storage.setItem("favoriteregions", favs.join(","));
    } else {
      currentFavs = currentFavs.filter((fav) => {
        return fav !== regionID;
      });
      storage.setItem("favoriteregions", currentFavs.join(","));
    }

    // Update in memory region
    const newRegion = Object.assign({}, memRegion, { isFavorite: !isFavorite });
    this.updateRegion(newRegion);
  }

  // --------------------- Static ---------------------- //

  static createOverrideID(name) {
    return `override::${name.trim().toLowerCase()}`.replace(" ", "_");
  }

  static localize(region) {
    const localized = Object.assign({}, region, {
      localizedName() {
        if (localized.id.includes("override::")) {
          return localized.name;
        }
        const name = t(localized.id);
        return name.length > 0 ? name : localized.name;
      },
    });

    return localized;
  }

  static createOverrideRegion({ name, host, port }) {
    if (!name) {
      throw new Error("name must not be empty");
    }
    if (!host) {
      throw new Error("host must not be empty");
    }
    if (typeof port !== "number") {
      throw new Error("port must be a number");
    }
    if (port < 0 || port > 65535) {
      throw new Error("invalid port range");
    }
    const lowerCaseName = name.toLowerCase();
    return RegionList.localize({
      id: RegionList.createOverrideID(lowerCaseName),
      override: true,
      name: lowerCaseName,
      host,
      ping: host,
      port,
      macePort: port,
      iso: "OR",
      scheme: "https",
      active: false,
      latency: "PENDING",
      offline: false,
      isFavorite: true,
      flag: "images/flags/override_icon_64.png",
    });
  }

  static createNormalRegion(regionID, region) {
    regionID = regionID.split(' ').join('_');
    return RegionList.localize({
      scheme: "https",
      id: regionID,
      ping: region.ping,
      name: region.name,
      iso: region.iso,
      host: region.dns,
      port: region.port,
      macePort: region.mace,
      flag: `/images/flags/${region.iso}_icon_64.png`,
      active: false,
      latency: "PENDING",
      offline: false,
      isFavorite: false,
      override: false,
    });
  }

  static debug(msg, err) {
    const debugMsg = `regionlist.js: ${msg}`;
    debug(debugMsg);
    if (err) {
      const errMsg = `regionlist.js error: ${JSON.stringify(
        err,
        Object.getOwnPropertyNames(err)
      )}`;
      debug(errMsg);
    }
    return new Error(debugMsg);
  }
}

export default RegionList;
