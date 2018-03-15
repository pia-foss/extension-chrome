/*
  https://developer.chrome.com/extensions/runtime#event-onUpdateAvailable
*/
export default function(app) {
  return (details) => {
    const {proxy} = app,
          {user} = app.util
    if(user.inLocalStorage() || (!user.authed && !proxy.enabled()))
      chrome.runtime.reload()
    else
      debug(`onupdateavailable.js: v${details.version} will be installed when chrome restarts`)
  }
}
