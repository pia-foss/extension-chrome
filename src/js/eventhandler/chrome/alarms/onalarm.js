export default function(app) {
  return function(alarm) {
    switch(alarm.name) {
    case "PollRegionList":
      app.util.regionlist.sync().then(() => {
        debug("onalarm.js: completed background poll of regions")
      }).catch((xhr) => {
        debug(`onalarm.js: background poll of regions failed (${xhr.tinyhttp.cause})`)
      })
      break
    default:
      break
    }
  }
}
