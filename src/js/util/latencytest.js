import http from '../helpers/http';

class LatencyTest {
  constructor(app) {
    this.app = app;
    this.testCount = 0;
  }

  async start(region) {
    const timeout = LatencyTest.TIMEOUT;
    const startTime = performance.now();
    this.testCount += 1;
    try {
      await http.head(`http://${region.host}:8888/ping.txt`, { timeout });
    }
    catch (err) {
      // do nothing
    }
    this.testCount -= 1;
    const endTime = performance.now();
    const duration = endTime - startTime;
    const latencyAvg = Math.floor(duration) >= LatencyTest.TIMEOUT ? 'error' : duration;

    return {
      region,
      latencyAvg,
    };
  }
}

LatencyTest.TIMEOUT = 3500;

export default LatencyTest;
