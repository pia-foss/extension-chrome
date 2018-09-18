import 'babel-polyfill';
import Renderer from 'renderer/renderer';
import initOnError from 'eventhandler/onerror';
import { sendMessage, Target, Type } from './helpers/messaging';

// get background app and renderer
const { app } = chrome.extension.getBackgroundPage();
const renderer = new Renderer(app, window, document);

// setup global bindings
window.debug = app.logger.debug;
window.t = app.util.i18n.t;
window.addEventListener('error', initOnError(app));
window.addEventListener('blur', () => {
  // TODO: Remove me when https://bugs.chromium.org/p/chromium/issues/detail?id=825867
  // is in General Availability Chrome
  window.close();
});

// inject locale stylesheet
const { i18n } = app.util;
const link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('href', `/css/locales/${i18n.locale}.css`);
document.head.appendChild(link);

// setup i18n
new Promise((resolve) => {
  const i18nWorker = i18n.worker();
  if (i18nWorker) { return i18nWorker; }
  return resolve();
})
  // on dom ready
  .then(() => {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') { resolve(); }
      else { document.addEventListener('DOMContentLoaded', resolve); }
    });
  })
  // setup key bindings
  .then(() => {
    let lastKeyIsCtrl = false;
    const keys = { ctrl: 17, d: 68 };
    const showDebugLog = (event) => {
      let showRenderer = false;
      if (renderer.currentTemplate === 'please_wait') { showRenderer = false; }
      else if (renderer.currentTemplate === 'debuglog') { showRenderer = false; }
      else if (event.ctrlKey && event.keyCode === keys.d) { showRenderer = true; }
      else if (lastKeyIsCtrl && event.keyCode === keys.d) { showRenderer = true; }
      return showRenderer;
    };

    document.onkeydown = (event) => {
      if (showDebugLog(event)) { renderer.renderTemplate('debuglog'); }
      if (event.keyCode === keys.ctrl) { lastKeyIsCtrl = true; }
      else { lastKeyIsCtrl = false; }
    };
  })
  // start the loading animation
  .then(() => { renderer.renderTemplate('please_wait'); })
  // check if regions need to be synched
  .then(() => {
    let regionPromise;
    const { regionlist } = app.util;
    if (regionlist.hasRegions()) { regionPromise = Promise.resolve(); }
    else { regionPromise = regionlist.sync(); }
    return regionPromise;
  })
  // check proxy settings loaded
  .then(() => {
    const { proxy } = app;
    if (proxy.settingsInMemory()) { return; }
    proxy.readSettings();
  })
  // check proxy controllable
  .then(() => { return app.proxy.isControllable(); })
  // capability checks
  .then((controllable) => {
    const { webrtc } = app.chromesettings;
    if (!webrtc.blockable) { return [controllable, true]; }
    return [controllable, false];
  })
  // render view
  .then(([controllable, needsUpgrade]) => {
    const { regionlist } = app.util;
    const hasRegions = regionlist.hasRegions();
    /* NOTE: port controllable handling to firefox */
    if (!controllable) { renderer.renderTemplate('uncontrollable'); }
    else if (needsUpgrade) { renderer.renderTemplate('upgrade_chrome'); }
    else if (app.util.user.loggedIn && hasRegions) { renderer.renderTemplate('authenticated'); }
    else { app.proxy.disable().then(() => { return renderer.renderTemplate('login'); }); }
  })
  // send frontend started message
  .then(() => {
    return sendMessage({
      target: Target.ALL,
      type: Type.FOREGROUND_OPEN,
    });
  })
  .catch((err) => { debug(err); });
