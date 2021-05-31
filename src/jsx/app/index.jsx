import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import App from "@app/app";
import applyOnError from "@eventhandler/onError";
import checkBrowserVersion from "@helpers/checkBrowserVersion";

import MockApp from "@mockapp/mockApp";

const { sendMessage, Target, Type } = typeof browser == "undefined" ? require('@helpers/messaging') : require('@helpers/messagingFirefox');


// get background app

let background;

let app;

background = chrome.extension.getBackgroundPage();


if (background) {
  ({ app } = background);
} else {
  app = new MockApp();
}
if (!background) {
  window.app = app;
} // in PB Mode, put app on window

let init;
if (app.initialize) { init = app.initialize(); }
else { init = Promise.resolve(); }

if(typeof browser == 'undefined'){
// setup i18n
Promise.resolve()
  // setup global bindings
  .then(() => {
    window.debug = app.logger.debug;
    window.t = app.util.i18n.t;
    applyOnError(app, {
      addListener(listener) {
        window.addEventListener("error", listener);
      },
    });
    if (typeof browser == "undefined") {
      if (checkBrowserVersion(67, 70, app)) {
        window.addEventListener("blur", () => {
          // win10 bug -> https://bugs.chromium.org/p/chromium/issues/detail?id=825867
          window.close();
        });
      }
    }
  })
  // inject locale stylesheet
  .then(() => {
    const { i18n } = app.util;
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", `/css/locales/${i18n.locale}.css`);
    document.head.appendChild(link);
  })
  // setup i18n
  .then(() => {
    const { i18n } = app.util;
    const i18nWorker = i18n.getWorker();
    if (i18nWorker) {
      return i18nWorker;
    }
    return Promise.resolve();
  })
  // on dom ready
  .then(() => {
    return new Promise((resolve) => {
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", resolve);
      }
    });
  })
  // check proxy settings loaded
  .then(() => {
    if (typeof browser == "undefined") {
      const { proxy } = app;
      if (proxy.settingsInMemory()) {
        return undefined;
      }
      return proxy.readSettings();
    }
  })
  // render App
  .then(() => {
    ReactDOM.render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
      document.getElementById("page-content")
    );
  })
  // send frontend started message
  .then(() => {
      return sendMessage({
        target: Target.ALL,
        type: Type.FOREGROUND_OPEN,
      });
  })
  .catch((err) => {
    debug(err);
  });

}else{
  init
  // setup global bindings
  .then(() => {
    window.debug = app.logger.debug;
    window.t = app.util.i18n.t;
    applyOnError(app, {
      addListener(listener) {
        window.addEventListener('error', listener);
      },
    });
  })
  // inject locale stylesheet
  .then(() => {
    const { i18n } = app.util;
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', `/css/locales/${i18n.locale}.css`);
    document.head.appendChild(link);
  })
  // setup i18n
  .then(() => {
    const { i18n } = app.util;
    const i18nWorker = i18n.getWorker();
    if (i18nWorker) {
      return i18nWorker;
    }
    return Promise.resolve();
  })
  // check on dom ready
  .then(() => {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') { resolve(); }
      else { document.addEventListener('DOMContentLoaded', resolve); }
    });
  })
  // render App
  .then(() => {
    ReactDOM.render(
      (
        <MemoryRouter>
          <App />
        </MemoryRouter>
      ),
      document.getElementById('page-content'),
    );
  })
  // send frontend started message
  .then(() => {
    return sendMessage(Target.ALL, Type.FOREGROUND_OPEN);
  })
  .catch((err) => { debug(err); });
}
