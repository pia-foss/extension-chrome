/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function onCompleted(app) {
  return (details) => {
    const { util: { counter } } = app;
    if (counter.get(details.requestId) >= 1) {
      counter.del(details.requestId);
    }
  };
}

export default createApplyListener((app, addListener) => {
  const { util: { httpsUpgrade } } = app;
  chrome.webRequest.onCompleted.addListener(httpsUpgrade.onCompleted, { urls: ['*://*/*'] });
  addListener(onCompleted(app), { urls: ['<all_urls>'] });
});
