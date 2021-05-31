/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function authenticate(app) {
  const hostR = /^https-[a-zA-Z0-9-]+\.privateinternetaccess\.com$/;

  const active = (details) => {
    const { proxy, util: { regionlist } } = app;
    let proxyEnabled;
    proxyEnabled = proxy.enabled();
    const isValidHost = regionlist.testHost(details.challenger.host);
    const isValidPort = regionlist.testPort(details.challenger.port);

    const isActive = 
    // proxyEnabled && 
         details.isProxy
      && hostR.test(details.challenger.host)
      && isValidHost
      && isValidPort;

    debug('onauthrequired.js: testing if active');
    debug(`proxy enabled: ${proxyEnabled}`);
    debug(`isProxy: ${details.isProxy}`);
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
      debug('onauthrequired.js: servicing request for authentication');
      if (!active(details)) { return debug('onAuthRequired/1: refused.'); }

      const { counter, user } = app.util;

      counter.inc(details.requestId);
      if (counter.get(details.requestId) > 1) {
        debug('onAuthRequired/1: failed.');
        counter.del(details.requestId);
        chrome.tabs.update({ url: chrome.extension.getURL('html/errorpages/authfail.html') });
        user.logout();
        return { cancel: true };
      }

      if (user.getLoggedIn()) {
        debug('onAuthRequired/1: allowed.');

        const username = user.getUsername();
        const password = user.getPassword();
        const token = user.getAuthToken();

        let credentials = { cancel: true };
        if (username && password) {
          credentials = { authCredentials: { username, password } };
        }
        else if (token) {
          const tokenUser = token.substring(0, token.length / 2);
          const tokenPass = token.substring(token.length / 2);
          credentials = { authCredentials: { username: tokenUser, password: tokenPass } };
        }
        return credentials;
      }

      debug('onAuthRequired/1: user not logged in');
      user.logout();
      chrome.tabs.reload(details.tabId);
      return { cancel: true };
    } catch (err) {
      debug('onAuthRequired/1: refused due to error');
      debug(`error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      return { cancel: true };
    }
  };
}

export default createApplyListener((app, addListener) => {
  addListener(authenticate(app), { urls: ['<all_urls>'] }, ['blocking']);
});
