export default function initOnMessage(app) {
  return function onMessage(msg, sender, sendResponse) {
    switch (msg.request) {
      case 'RequestCredentials': {
        const { user, i18n } = app.util;
        const domains = i18n.domainMap.values();
        const allowedUrls = Array.from(domains).map((v) => {
          return `https://${v}/xpages/sign-in`;
        });
        if (user.authed && allowedUrls.includes(msg.url)) {
          sendResponse({ user: user.getUsername(), pass: user.getPassword() });
        }
        break;
      }
      case 'RequestErrorInfo': {
        const { errorinfo } = app.util;
        sendResponse(errorinfo.get(msg.id));
        break;
      }
      case 'RequestErrorDelete': {
        const { errorinfo } = app.util;
        errorinfo.delete(msg.id);
        break;
      }
      case 't': {
        const { i18n } = app.util;
        const m = i18n.t(msg.localeKey);
        sendResponse({ m });
        break;
      }
      default: {
        break;
      }
    }
  };
}
