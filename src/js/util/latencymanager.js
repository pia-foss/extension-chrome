import http from '@helpers/http';
import * as compare from '@helpers/compare';

/**
 * LatencyManager
 * ==============
 *
 * Responsible for managing the `latency` field for regions.
 *
 * "round" - record RTT for single request to region
 * "test" -  perform ${ROUNDS} rounds consecutively
 * "run" - perform ${MAX_CONCURRENT} tests concurrently
 */
class LatencyManager {
  static get MAX_CONCURRENT() { return 24; }

  static get ROUNDS() { return 3; }

  constructor(app) {
    this.app = app;
    this.run = this.run.bind(this);
  }

  get regionlist() { return this.app.util.regionlist; }

  /**
   * Runs the latency tests
   *
   * @return {Promise} resolves when tests complete
   */
  async run() {
    const { regionlist } = this;
    const start = performance.now();
    const queue = regionlist.toArray();
    const tests = LatencyManager.array(LatencyManager.MAX_CONCURRENT).map(() => {
      return LatencyManager.runTest({ queue, regionlist });
    });
    await Promise.all(tests);
    const end = performance.now();
    const duration = Math.floor(end - start);
    debug(`latencymanager.js: finished latency tests in ${duration}ms`);
  }

  static async round(region) {
    try {
      const start = performance.now();
      await http.head(`http://${region.ping}:8888/ping.txt`);
      const end = performance.now();
      const duration = Math.floor(end - start);
      return duration;
    }
    catch (err) {
      return 'ERROR';
    }
  }

  static async runTest({ queue, regionlist }) {
    const region = queue.pop();
    if (!region) return Promise.resolve();
    const results = [];
    for (let i = 0; i < LatencyManager.ROUNDS; i++) {
      results.push(await LatencyManager.round(region));
    }
    const latency = results.sort(compare.byLatency).shift();
    regionlist.updateRegion({ ...region, latency });

    return LatencyManager.runTest({ queue, regionlist });
  }

  static array(size) {
    return [...Array(size)];
  }
}

export default LatencyManager;
