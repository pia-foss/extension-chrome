/*

  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
export default function(app) {
  const networkErrors = ["net::ERR_CONNECTION_RESET",
                         "net::ERR_PROXY_CONNECTION_FAILED",
                         "net::ERR_CONNECTION_TIMED_OUT"],
        tabQueries    = [
          {active: true, status: "loading" , url: ["http://*/*", "https://*/*"]},
          {active: true, status: "complete", url: ["http://*/*", "https://*/*"]}
        ]

  return function(details) {
    const connectedToPIA    = app.proxy.enabled(),
          errorOnMainFrame  = details.type === "main_frame",
          catchableError    = networkErrors.indexOf(details.error) > -1
    if(!connectedToPIA || !errorOnMainFrame || !catchableError)
      return
    tabQueries.forEach((query) => {
      chrome.tabs.query(query, (tabs) => {
        tabs.forEach((tab) => {
          const errorID      = app.util.errorinfo.set(details.error, details.url),
                errorPageURL = chrome.extension.getURL(`html/errorpages/connfail.html?id=${errorID}`)
          chrome.tabs.update(tab.id, {url: errorPageURL})
        })
      })
    })
    debug(`connection error: ${details.error}`)
    return {cancel: true}
  }
}
