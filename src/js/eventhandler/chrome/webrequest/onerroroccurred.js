/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function openErrorPage(app) {
  const networkErrors = [
    'net::ERR_CONNECTION_RESET',
    'net::ERR_PROXY_CONNECTION_FAILED',
    'net::ERR_CONNECTION_TIMED_OUT',
  ];
  const tabQueries = [
    { active: true, status: 'loading', url: ['http://*/*', 'https://*/*'] },
    { active: true, status: 'complete', url: ['http://*/*', 'https://*/*'] },
  ];

  return (details) => {
    const connectedToPIA = app.proxy.enabled();
    const errorOnMainFrame = details.type === 'main_frame';
    const catchableError = networkErrors.indexOf(details.error) > -1;

    if (!connectedToPIA || !errorOnMainFrame || !catchableError) {
      return { cancel: false };
    }
    tabQueries.forEach((query) => {
      chrome.tabs.query(query, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id === details.tabId) {
            const errorID = app.util.errorinfo.set(details.error, details.url);
            const errorPageURL = chrome.extension.getURL(`html/errorpages/connfail.html?id=${errorID}`);
            chrome.tabs.update(tab.id, { url: errorPageURL });
          }
        });
      });
    });
    debug(`connection error: ${details.error}`);
    return { cancel: true };
  };
}

export default createApplyListener((app, addListener) => {
  addListener(openErrorPage(app), { urls: ['<all_urls>'] });
});
