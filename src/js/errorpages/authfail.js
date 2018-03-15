import {t} from "errorpages/utils"

(new function(window, document) {
  document.addEventListener('DOMContentLoaded', async () => {
    const pageTitle      = document.querySelector("head title"),
          errorTitle     = document.querySelector("h1#title"),
          errorMessage   = document.querySelector("h4#message")
    pageTitle.innerHTML    = await t("AuthFailPageTitle")
    errorTitle.innerHTML   = await t("AuthFailTitle")
    errorMessage.innerHTML = await t("AuthFailMessage")
  })

  return this
}(window, document))
