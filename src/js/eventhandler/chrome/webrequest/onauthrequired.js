/*

  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
export default function (app) {
  const hostR = /^https-[a-zA-Z0-9-]+\.privateinternetaccess\.com$/;
  const active = (details) => {
    const { proxy, util: { regionlist } } = app;
    const isValidHost = regionlist.testHost(details.challenger.host);
    const isValidPort = regionlist.testPort(details.challenger.port);
    const proxyEnabled = proxy.getEnabled();
    const { isProxy } = details;
    const isActive = (
      isProxy
      && isValidHost
      && isValidPort
      && proxyEnabled
      && hostR.test(details.challenger.host)
    );
    debug('onauthrequired.js: testing if active');
    debug(`proxy enabled: ${proxyEnabled}`);
    debug(`isProxy: ${isProxy}`);
    debug(`challenger host: ${details.challenger.host}`);
    debug(`challenger port: ${details.challenger.port}`);
    debug(`possible hosts: ${JSON.stringify(regionlist.getPotentialHosts())}`);
    debug(`possible ports: ${JSON.stringify(regionlist.getPotentialPorts())}`);
    debug(`isActive: ${isActive}`);
    debug('onauthrequired.js: end test');

    return isActive;
  };

  return function handle(details) {
    try {
      if (!active(details)) {
        debug('onAuthRequired/1: refused.');
        return {};
      }

      const { counter, user } = app.util;

      counter.inc(details.requestId);

      if (counter.get(details.requestId) > 1) {
        debug('onAuthRequired/1: failed.');
        counter.del(details.requestId);
        chrome.tabs.update({ url: chrome.extension.getURL('html/errorpages/authfail.html') });
        user.logout();
        return { cancel: true };
      }

      if (user.loggedIn) {
        debug('onAuthRequired/1: allowed.');
        return { authCredentials: { username: user.getUsername(), password: user.getPassword() } };
      }

      debug('onAuthRequired/1: user not logged in');
      user.logout();
      chrome.tabs.reload(details.tabId);
    }
    catch (err) {
      debug('onAuthRequired/1: refused due to error');
      debug(`error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      return { cancel: true };
    }

    return { cancel: true };
  };
}
