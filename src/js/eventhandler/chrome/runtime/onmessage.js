/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function initOnMessage(app) {
  return (msg, _sender, sendResponse) => {
    switch (msg.request) {
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

export default createApplyListener((app, addListener) => {
  addListener(initOnMessage(app));
});
