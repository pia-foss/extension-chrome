import tinyhttp from "tinyhttp"

export default function(app) {
  this.testCount = 0

  this.start = (region) => {
    return new Promise((resolve) => {
      let t0
      const http = tinyhttp(`http://${region.host}:8888`, {timeout: 3500}),
            complete = () => {
              const duration = performance.now() - t0
              this.testCount -= 1
              resolve({region, latencyAvg: Math.floor(duration) >= 3500 ? "error" : duration})
            }
      t0 = performance.now()
      http.get('/ping.txt').then(complete).catch(complete)
      this.testCount += 1
    })
  }

  return this
}
