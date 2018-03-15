import tinyhttp from "tinyhttp"

export default function(app) {
  const self = Object.create(null),
        http = tinyhttp("https://www.privateinternetaccess.com"),
        {storage} = app.util,
        defaultRegionID  = "us_new_york_city",
        regionMap = new Map(),
        createLocalizedName = (regionID, region) => {
          const name = t(regionID)
          return name.length > 0 ? name : region.name
        },
        createRegion = (regionID, region) => {
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
            offline:       false
          }
        }

  self.synced  = false
  self.syncing = false

  self.toArray = () => {
    return Array.from(regionMap.values())
  }

  self.isSelectedRegion = (region) => {
    return self.getSelectedRegion().id === region.id
  }

  /*
    we keep an on-disk copy of the last selected region,
    incase this method is called when the region list has
    not synced.
  */
  self.getSelectedRegion = () => {
    const fromMemory  = self.toArray().find(region => region.active),
          fromStorage = storage.getItem("region")
    if(fromMemory)
      return fromMemory
    if(fromStorage) {
      const region = JSON.parse(fromStorage)
      region.localizedName = () => createLocalizedName(region.id, region)
      return region
    }
  }

  self.setSelectedRegion = (id) => {
    const region = regionMap.get(id)
    if(region) {
      self.toArray().forEach(_region => _region.active = false)
      region.active = true
      storage.setItem("activeproxy", region.id)
      storage.setItem("region", JSON.stringify(region))
    }
  }

  self.sync = () => {
    self.syncing = true
    debug(`regionlist.js: start sync`)
    return http.get("/api/client/services/https", {timeout: 5000}).then((xhr) => {
      regionMap.clear()
      const res = JSON.parse(xhr.response)
      for(let regionID in res)
        regionMap.set(regionID, createRegion(regionID, res[regionID]))
      self.setSelectedRegion(storage.getItem("activeproxy") || defaultRegionID)
      self.syncing = false
      self.synced = true
      debug("regionlist.js: sync ok")
      return xhr
    }).catch((xhr) => {
      self.syncing = false
      self.synced = false
      debug(`regionlist.js: sync error (${xhr.tinyhttp.cause})`)
      return xhr
    })
  }

  chrome.alarms.create("PollRegionList", {delayInMinutes: 30, periodInMinutes: 30})

  return self
}
