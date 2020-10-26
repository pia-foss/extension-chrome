import '@babel/polyfill';
import '@style/errorpage';
import URLParser from 'url';
import escapeHTML from 'escape-html';

import { t } from '@errorpages/utils';

/**
 * This IIFE is necessary for top level async functions
 *
 * Removing this results in async functions being hoisted above the '@babel/polyfill'
 * import, and a ReferenceError occurring
 */
(function scope() {
  const PAGE_TITLE_SELECTOR = 'head title';
  const ERROR_TITLE_SELECTOR = 'h1#title';
  const ERROR_MESSAGE_SELECTOR = 'h4#message';
  const TRY_AGAIN_BTN_SELECTOR = 'a#try-again';
  const ERROR_NAME_SPAN_SELECTOR = 'span#error';

  const HASH = 'reload';

  async function debug(msg) {
    return new Promise((resolve) => {
      return chrome.runtime.getBackgroundPage(resolve);
    })
      .then(({ app }) => {
        return app.logger.debug;
      })
      .then((backgroundDebug) => {
        backgroundDebug(msg);
      });
  }

  /**
   * Convert the provided uri to safe value
   *
   * @param {string} uri provided uri to escape
   *
   * @returns {string} safe uri
   */
  function safeUri(uri) {
    return escapeHTML(encodeURI(decodeURI(uri)));
  }

  /**
   * Set the innerHTML of a particular HTML element
   *
   * @param {string} selector CSS Selector for element
   * @param {string} contents contents to insert
   */
  function setContents(selector, contents) {
    const el = document.querySelector(selector);
    el.innerHTML = contents;
  }

  /**
   * Set the innerHTML of an element to translated text
   *
   * @param {string} selector CSS Selector for element
   * @param {string} key Translation key for text
   */
  async function setTranslatedContents(selector, key) {
    const contents = await t(key);
    setContents(selector, contents);
  }

  /**
   * Reconnect to website when online
   */
  function onlineListener() {
    window.location.reload();
  }

  /**
   * Async wrapper around chrome.runtime.sendMessage
   */
  async function sendMessage(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Fetch the error information for the current url
   *
   * @returns {Promise<*>} errorInfo object
   */
  async function getErrorInfo() {
    const { query: { id } } = URLParser.parse(document.location.href, true);
    const message = {
      id,
      request: 'RequestErrorInfo',
    };
    const [errorName, errorUri] = await sendMessage(message);

    return { errorName, errorUri, id };
  }

  /**
   * Perform actions on the page after the content has loaded
   */
  async function onContentLoaded() {
    try {
      // Get error info
      const errorInfo = await getErrorInfo();
      const { errorName } = errorInfo;
      let { errorUri } = errorInfo;
      errorUri = safeUri(errorUri);

      // Setup page
      window.addEventListener('online', onlineListener);
      document.location.hash = HASH;

      // Setup page contents
      const errorNameSpan = document.querySelector(ERROR_NAME_SPAN_SELECTOR);
      const tryAgainBtn = document.querySelector(TRY_AGAIN_BTN_SELECTOR);
      tryAgainBtn.setAttribute('href', errorUri);
      errorNameSpan.innerHTML = errorName;
      tryAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = errorUri;
      });
      await Promise.all([
        setTranslatedContents(PAGE_TITLE_SELECTOR, 'ConnectionFailPageTitle'),
        setTranslatedContents(ERROR_TITLE_SELECTOR, 'ConnectionFailTitle'),
        setTranslatedContents(ERROR_MESSAGE_SELECTOR, 'ConnectionFailMessage'),
        setTranslatedContents(TRY_AGAIN_BTN_SELECTOR, 'TryAgain'),
      ]);
    }
    catch (err) {
      await debug(`connfail.js::error - ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    }
  }

  document.addEventListener('DOMContentLoaded', onContentLoaded);
}());
