/*

  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import 'url';

export default function onBeforeRequest(app) {
  const utmParamNames = ['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_campaign'];
  const hasUTMQuery = (url) => {
    return !!utmParamNames.find((name) => {
      return url.searchParams.has(name);
    });
  };
  const newURLWithoutUTMQuery = (url) => {
    utmParamNames.forEach((name) => {
      return url.searchParams.delete(name);
    });
    return url.toString();
  };
  const connUrl = `chrome-extension://${chrome.runtime.id}/html/errorpages/connfail.html`;
  const isConnFailReload = (url) => {
    return connUrl === url.slice(0, connUrl.length) && url.slice(-7, url.length) === '#reload';
  };
  const getURLFromErrorID = (errorID) => {
    const { errorinfo } = app.util;
    const url = errorinfo.get(errorID)[1];
    return url;
  };

  return (details) => {
    const { proxy } = app;
    const { settings } = app.util;

    // We handle the connfail redirects here because a bug exists in chrome
    // resulting in page resources not being after a redirect using window.location.
    // https://stackoverflow.com/questions/11950306/chrome-background-images-not-rendered-after-refreshing-page-javascript-redire
    if (isConnFailReload(details.url)) {
      const errorID = new URL(details.url).searchParams.get('id');
      const message = {
        id: errorID,
        request: 'RequestErrorDelete',
      };
      chrome.runtime.sendMessage(message);
      const redirectUrl = getURLFromErrorID(errorID);
      if (redirectUrl) {
        debug('connfail. try reload failed URL');
      }
      return redirectUrl ? { redirectUrl } : undefined;
    }
    if (!proxy.enabled()) {
      return undefined;
    }
    if (settings.getItem('blockutm')) {
      const url = new URL(details.url);
      const redirectUrl = hasUTMQuery(url) ? newURLWithoutUTMQuery(url) : undefined;
      if (redirectUrl) {
        debug('blockutm. remove UTM query string.');
      }

      return redirectUrl ? { redirectUrl } : undefined;
    }

    return undefined;
  };
}
