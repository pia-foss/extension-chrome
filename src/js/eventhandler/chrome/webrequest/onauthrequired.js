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
    const { proxy } = app;
    const { regionlist, settings } = app.util;
    const region = regionlist.getSelectedRegion();
    const port = settings.getItem('maceprotection') ? region.macePort : region.port;
    return proxy.enabled()
      && details.isProxy
      && hostR.test(details.challenger.host)
      && region.host === details.challenger.host
      && port === details.challenger.port;
  };

  return function handle(details) {
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

    if (user.loggedIn) {
      debug('onAuthRequired/1: allowed.');
      return { authCredentials: { username: user.getUsername(), password: user.getPassword() } };
    }


    debug('onAuthRequired/1: user not logged in');
    user.logout();
    chrome.tabs.reload(details.tabId);
    return { cancel: true };
  };
}
