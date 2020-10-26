import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import App from '@app/app';
import applyOnError from '@eventhandler/onError';
import { sendMessage, Target, Type } from '@helpers/messaging';
import checkBrowserVersion from '@helpers/checkBrowserVersion';

// get background app
const background = chrome.extension.getBackgroundPage();
const { app } = background;

// setup i18n
Promise.resolve()
  // setup global bindings
  .then(() => {
    window.debug = app.logger.debug;
    window.t = app.util.i18n.t;
    applyOnError(app, {
      addListener(listener) {
        window.addEventListener('error', listener);
      },
    });
    if (checkBrowserVersion(67, 70)) {
      window.addEventListener('blur', () => {
        // win10 bug -> https://bugs.chromium.org/p/chromium/issues/detail?id=825867
        window.close();
      });
    }
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
    if (i18nWorker) { return i18nWorker; }
    return Promise.resolve();
  })
  // on dom ready
  .then(() => {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') { resolve(); }
      else { document.addEventListener('DOMContentLoaded', resolve); }
    });
  })
  // check proxy settings loaded
  .then(() => {
    const { proxy } = app;
    if (proxy.settingsInMemory()) { return undefined; }
    return proxy.readSettings();
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
    return sendMessage({
      target: Target.ALL,
      type: Type.FOREGROUND_OPEN,
    });
  })
  .catch((err) => { debug(err); });
