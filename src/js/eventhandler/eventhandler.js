import applyOnAuthRequired from '@eventhandler/chrome/webrequest/onAuthRequired';
import applyOnBeforeRedirect from '@eventhandler/chrome/webrequest/onBeforeRedirect';
import applyOnBeforeRequest from '@eventhandler/chrome/webrequest/onBeforeRequest';
import applyWebRequestOnCompleted from '@eventhandler/chrome/webrequest/onCompleted';
import applyOnWebRequestError from '@eventhandler/chrome/webrequest/onErrorOccurred';

import applyOnInstalled from '@eventhandler/chrome/runtime/onInstalled';
import applyOnMessage from '@eventhandler/chrome/runtime/onMessage';
import applyOnUpdateAvailable from '@eventhandler/chrome/runtime/onUpdateAvailable';

import applyOnChanged from '@eventhandler/chrome/cookies/onChanged';

import applyOnAlarm from '@eventhandler/chrome/alarms/onAlarm';

import applyOnError from '@eventhandler/onError';

export default function (app) {
  const self = {};
  applyOnAuthRequired(app, chrome.webRequest.onAuthRequired);
  applyOnBeforeRedirect(app, chrome.webRequest.onBeforeRedirect);
  applyOnBeforeRequest(app, chrome.webRequest.onBeforeRequest);
  applyWebRequestOnCompleted(app, chrome.webRequest.onCompleted);
  applyOnWebRequestError(app, chrome.webRequest.onErrorOccurred);

  applyOnInstalled(app, chrome.runtime.onInstalled);
  applyOnMessage(app, chrome.runtime.onMessage);
  applyOnUpdateAvailable(app, chrome.runtime.onUpdateAvailable);

  applyOnChanged(app, chrome.cookies.onChanged);

  applyOnAlarm(app, chrome.alarms.onAlarm);

  applyOnError(app, {
    addListener(listener) {
      window.addEventListener('error', listener);
    },
  });

  return self;
}
