export default function(app) {
  const self         = this,
        latencytest  = app.util.latencytest,
        allRegionsAreOffline = (regions) => {
          return regions.every((region) => region.offline)
        },
        setRegionState = (region, avgLatency) => {
          if(avgLatency === "error" || avgLatency > 3500) {
            region.offline = true
            region.latency = 50000
            debug(`regionsorter.js: '${region.name.toLowerCase()}' offline.`)
          } else {
            region.offline = false
            region.latency = avgLatency
          }
        },
        finished = (resolver, regions) => {
          if(latencytest.testCount === 0) {
            if(allRegionsAreOffline(regions))
              self.nameSort(regions).then((regions) => resolver(regions))
            else
              resolver(regions.sort((a,b) => { return a.latency - b.latency }))
            debug("regionsorter.js: finished latency test.")
            return true
          }
        }

  let inProgressPromise

  self.nameSort = (regions) => {
    return new Promise((resolver) => {
      resolver(regions.sort((a, b) => a.name.localeCompare(b.name)))
    })
  }

  self.latencySort = (regions) => {
    inProgressPromise = inProgressPromise || new Promise((resolver) => {
      let curpos        = 0,
          concurrency   = 12, /* The number of tests to run concurrently. */
          receiveResult = (res) => {
            const {region,latencyAvg} = res
            setRegionState(region, latencyAvg)
            curpos++
            if(finished(resolver, regions))
              inProgressPromise = undefined
            else
              regions[curpos] && latencytest.start(regions[curpos]).then(receiveResult)
          }
      for(let i = 0; i < concurrency; i++)
        latencytest.start(regions[i]).then(receiveResult)
    })
    return inProgressPromise
  }

  return self
}
