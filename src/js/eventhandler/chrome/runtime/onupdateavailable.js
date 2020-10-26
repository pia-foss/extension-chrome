/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function initReload(app) {
  return (details) => {
    const { proxy } = app;
    const { user } = app.util;
    if (user.inLocalStorage() || (!user.getLoggedIn() && !proxy.enabled())) {
      chrome.runtime.reload();
    }
    else {
      debug(`onupdateavailable.js: v${details.version} will be installed when chrome restarts`);
    }
  };
}

export default createApplyListener((app, addListener) => {
  addListener(initReload(app));
});
