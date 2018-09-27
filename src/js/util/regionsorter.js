export default function (app) {
  let inProgressPromise;
  const self = this;
  const { latencytest } = app.util;

  const allRegionsAreOffline = (regions) => {
    return regions.every((region) => { return region.offline; });
  };

  const setRegionState = (regionParam, avgLatency) => {
    const region = regionParam;
    if (avgLatency === 'error' || avgLatency > 3500) {
      region.offline = true;
      region.latency = 50000;
      debug(`regionsorter.js: '${region.name.toLowerCase()}' offline.`);
    }
    else {
      region.offline = false;
      region.latency = avgLatency;
    }
  };

  const finished = (resolve, regions) => {
    if (latencytest.testCount === 0) {
      if (allRegionsAreOffline(regions)) {
        self.nameSort(regions).then((sortedRegions) => { return resolve(sortedRegions); });
      }
      else {
        resolve(regions.sort((a, b) => { return a.latency - b.latency; }));
      }
      debug('regionsorter.js: finished latency test.');
      return true;
    }

    return false;
  };

  self.nameSort = (regions) => {
    return new Promise((resolve) => {
      const regionsSortedByName = regions.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return resolve(regionsSortedByName);
    });
  };

  self.latencySort = (regions) => {
    // return empty array if regions are empty or undefined
    if (!regions || regions.length === 0) { return Promise.resolve([]); }

    // return current promise if already exists
    if (inProgressPromise) { return inProgressPromise; }

    // set new promise with latency tests to inProgressPromise
    inProgressPromise = new Promise((resolve) => {
      let curpos = 0;
      const maxConcurrency = 12; /* The number of tests to run concurrently. */

      const receiveResult = (res) => {
        const { region, latencyAvg } = res;
        setRegionState(region, latencyAvg);
        curpos += 1;

        if (finished(resolve, regions)) { inProgressPromise = undefined; }
        else if (regions[curpos]) {
          latencytest.start(regions[curpos]).then(receiveResult);
        }
      };

      for (let i = 0; i < maxConcurrency; i++) {
        latencytest.start(regions[i]).then(receiveResult);
      }
    });

    // return promise
    return inProgressPromise;
  };

  return self;
}
