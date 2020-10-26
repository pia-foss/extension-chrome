/*
   IMPORTANT
   =========

   Sending too many requests to `privateinternetaccess.com` results
   in increased DNS costs.

   Current Approach
   ----------------

   Run updates:
   1) before proxy connects (real ip)
   2) after proxy connects (proxy ip)
   3) after proxy disconnects (real ip)
 */

import http from '@helpers/http';
import reportError from '@helpers/reportError';
import timer from '@helpers/timer';

class IpManager {
  constructor(app) {
    // bindings
    this.getRealIP = this.getRealIP.bind(this);
    this.getProxyIP = this.getProxyIP.bind(this);
    this.updateIpByRegion = this.updateIpByRegion.bind(this);

    // init
    this.app = app;
    this.realIP = null;
    this.proxyIP = null;
  }

  getRealIP() {
    return this.realIP;
  }

  getProxyIP() {
    return this.proxyIP;
  }

  getIPs() {
    return {
      realIP: this.getRealIP(),
      proxyIP: this.getProxyIP(),
    };
  }

  updateIpByRegion(tab){
    const location = this.app.util.regionlist.getRegionById(tab.customCountry);
    if(location){
      this.proxyIP = location.ping;
    }else{
      this.update();
    }
  }

  /**
   * Update an IP
   *
   * If proxy currently connected, will update proxyIP
   * If proxy current disconnected, will update realIP
   *
   * Recommended not to await this method if retry is enabled
   *
   * @param {*} opts
   * @param {boolean} retry whether to retry on failure (takes up to 7mins)
   */
  async update(
    {
      retry = false,
    } = {},
  ) {
    debug('ipmanager: updating ip address');
    let attempt = 0;
    const maxAttempts = retry ? 10 : 0;
    const attemptUpdate = async () => {
      const url = 'https://www.privateinternetaccess.com/api/client/services/https/status';
      const res = await http.get(url);
      const info = await res.json();
      const { ip } = info;
      let { connected } = info;
      connected = (String(connected) === 'true');
      if (connected) {
        this.proxyIP = ip;
      }
      else {
        this.realIP = ip;
        this.proxyIP = null;
      }
      this.app.courier.sendMessage('refresh');
    };
    while (attempt <= maxAttempts) {
      await timer((attempt ** 2) * 1000);
      try {
        await attemptUpdate();
        break;
      }
      catch (err) {
        reportError('ipmanager', err);
      }
      attempt += 1;
    }
  }
}

export default IpManager;
