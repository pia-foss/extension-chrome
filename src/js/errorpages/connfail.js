import {t} from "errorpages/utils";
import URLParser  from 'url';
import escapeHTML from 'escape-html';

(new function(window, document) {
  const queryStr = URLParser.parse(document.location.href, true).query;
  const safeURI  = (uri) => {
    const encodedURI = encodeURI(decodeURI(uri));
    return escapeHTML(encodedURI);
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const pageTitle    = document.querySelector("head title");
    const errorTitle   = document.querySelector("h1#title");
    const errorMessage = document.querySelector("h4#message");

    pageTitle.innerHTML    = await t("ConnectionFailPageTitle");
    errorTitle.innerHTML   = await t("ConnectionFailTitle");
    errorMessage.innerHTML = await t("ConnectionFailMessage");

    document.location.hash = "reload";

    let message = {request: "RequestErrorInfo", id: queryStr.id};
    chrome.runtime.sendMessage(message, async (response) => {
      if(!response) { return; }

      const [errorName, uri] = response;
      const tryAgainBtn      = document.querySelector("a#try-again");
      const errorNameSpan    = document.querySelector("span#error");

      tryAgainBtn.setAttribute("href", safeURI(uri));
      tryAgainBtn.innerHTML = await t("TryAgain");
      errorNameSpan.innerHTML = errorName;

      window.onunload = () => {
        return chrome.runtime.sendMessage({request: "RequestErrorDelete", id: queryStr.id});
      }
    });
  });

  return this;
}(window, document))
