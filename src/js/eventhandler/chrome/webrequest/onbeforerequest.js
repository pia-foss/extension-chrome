/*

  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import 'url'
export default function(app) {
  const utmParamNames = ["utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign"],
        hasUTMQuery = (url) => utmParamNames.find((name) => url.searchParams.has(name)),
        newURLWithoutUTMQuery = (url) => {
          utmParamNames.forEach((name) =>  url.searchParams.delete(name))
          return url.toString()
        },
        connUrl = `chrome-extension://${chrome.runtime.id}/html/errorpages/connfail.html`,
        isConnFailReload = (url) => {
          return connUrl === url.slice(0, connUrl.length) && url.slice(-7, url.length) === "#reload"
        },
        getURLFromErrorID = (errorID) => {
          const {errorinfo} = app.util,
                [_, url]  = errorinfo.get(errorID)
          return url
        }

  return (details) => {
    const {proxy} = app,
          {settings} = app.util
    if(isConnFailReload(details.url)) {
      const errorID = new URL(details.url).searchParams.get('id'),
            redirectUrl = getURLFromErrorID(errorID)
      if(redirectUrl)
        debug(`connfail. try reload failed URL`)
      return redirectUrl ? {redirectUrl} : undefined
    }
    if(!proxy.enabled())
      return
    if(settings.getItem("blockutm")) {
      const url = new URL(details.url),
            redirectUrl = hasUTMQuery(url) ? newURLWithoutUTMQuery(url) : undefined
      if(redirectUrl)
        debug(`blockutm. remove UTM query string.`)
      return redirectUrl ? {redirectUrl} : undefined
    }
  }
}
