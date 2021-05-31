export default class Network {
  constructor(app) {
    this.app = app;
    this.status = navigator.onLine;

    window.addEventListener('online', this.updateNetworkStatus);
    window.addEventListener('offline', this.updateNetworkStatus);

    // bindings
    this.updateNetworkStatus = this.updateNetworkStatus.bind(this);
  }

  async updateNetworkStatus() {
    // update local status
    this.status = navigator.onLine;
    if(typeof browser == 'undefined'){
      this.app.courier.sendMessage('refresh');
    }

    // check for region data
    const { regionlist } = this.app.util;
    if (!regionlist.hasRegions()) {
      // return here since sync will also call the latency tests
      return regionlist.sync();
    }

    // check to see if latency needs to updated
    // TODO: build a property into latencyManager to ensure to tests can't run at the same time
    const regions = regionlist.toArray();
    const pending = regions.some((region) => {
      return region.latency === 'PENDING';
    });

    const { latencymanager } = this.app.util;
    if (pending) {
      await latencymanager.run();
      if(typeof browser == 'undefined'){
        this.app.courier.sendMessage('refresh');
      }
    }

    return Promise.resolve();
  }
}
