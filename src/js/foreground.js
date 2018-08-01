import 'babel-polyfill';
import Renderer from "renderer/renderer";
import initOnError from "eventhandler/onerror";

(new function() {
  const app      = chrome.extension.getBackgroundPage().app;
  const renderer = new Renderer(app, window, document);
  window.debug = app.logger.debug; /* eslint-ignore no-unused-vars */
  window.t = app.util.i18n.t; /* eslint-ignore no-unused-vars */
  window.addEventListener('error', initOnError(app));

  document.addEventListener('DOMContentLoaded', () => {
    let pollID = null;
    const {proxy} = app;
    const {webrtc} = app.chromesettings;
    const {user,regionlist,i18n} = app.util;

    const pollUntilReady = () => {
      if (!user.authing && !regionlist.syncing) {
        clearInterval(pollID);
        debug("foreground.js: end polling.");

        if (user.authed && regionlist.synced) {
          renderer.renderTemplate("authenticated");
        }
        else {
          proxy.disable().then(() => renderer.renderTemplate("login"));
        }
      }
    };

    const renderTemplate = () => {
      const i18nworker = i18n.worker();

      if (i18nworker) {
        return i18nworker.then(renderTemplate).catch(renderTemplate);
      }

      if (!proxy.isControllable()) {
        return renderer.renderTemplate("uncontrollable");
      }

      if (!webrtc.blockable) {
        return renderer.renderTemplate("upgrade_chrome");
      }

      if (!regionlist.synced) { regionlist.sync(); }

      if (regionlist.syncing || user.authing) {
        renderer.renderTemplate("please_wait");
        pollID = setInterval(pollUntilReady, 10);
        debug("foreground.js: start polling");
      }
      else if (user.authed) {
        renderer.renderTemplate("authenticated");
      }
      else {
        proxy.disable().then(() => renderer.renderTemplate("login"));
      }

      /* inject locale stylesheet. */
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", `/css/locales/${i18n.locale}.css`);
      document.head.appendChild(link);
    };

    if (proxy.settingsInMemory()) { renderTemplate(); }
    else { proxy.readSettings().then(renderTemplate); }
  });

  (() => {
    let lastKeyIsCtrl = false;
    const keys = {ctrl: 17, d: 68};

    const showDebugLog = (event) => {
      if (renderer.currentTemplate === "please_wait" || renderer.currentTemplate === "debuglog") {
        return false;
      }
      if (event.ctrlKey && event.keyCode === keys.d) { return true; }
      if (lastKeyIsCtrl && event.keyCode === keys.d) { return true; }
    };

    document.onkeydown = (event) => {
      if (showDebugLog(event))  { renderer.renderTemplate("debuglog"); }
      if (event.keyCode === keys.ctrl) { lastKeyIsCtrl = true; }
      else { lastKeyIsCtrl = false; }
    };
  })();
}());
