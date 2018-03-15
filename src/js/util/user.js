import tinyhttp from "tinyhttp"

export default function(app, $) {
  const self = this,
        {storage, settings} = app.util,
        http = tinyhttp("https://www.privateinternetaccess.com")

  self.authed  = false
  self.authing = false
  self.authTimeout = 5000

  self.storageBackend = () => {
    return settings.getItem("rememberme") ? "localStorage" : "memoryStorage"
  }

  self.inLocalStorage = () => {
    return self.storageBackend() === "localStorage"
  }

  self.username = () => {
    const username = storage.getItem("form:username", self.storageBackend())
    if(username) return username.trim()
    else return ""
  }

  self.password = () => {
    const password = storage.getItem("form:password", self.storageBackend())
    if(password) return password
    else return ""
  }

  self.removeUsernameAndPasswordFromStorage = () => {
    storage.removeItem("form:username", self.storageBackend())
    storage.removeItem("form:password", self.storageBackend())
  }

  self.inStorage = () => {
    return self.username().length > 0 && self.password().length > 0
  }

  self.auth = () => {
    const username = self.username(),
          password = self.password(),
          {icon}   = app.util,
          headers  = {"Authorization": `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`}
    debug("user.js: start auth")
    return http.head("/api/client/auth", {headers, timeout: self.authTimeout}).then((xhr) => {
      self.authing = false
      self.authed = true
      icon.updateTooltip()
      debug("user.js: auth ok")
      return xhr
    }).catch((xhr) => {
      self.authing = false
      self.authed = false
      debug(`user.js: auth error, ${xhr.tinyhttp.cause}`)
      throw(xhr)
    })
  }

  self.logout = (afterLogout) => { /* FIXME: remove callback for promise chaining. */
    const {proxy} = app,
          {icon} = app.util
    return proxy.disable().then(() => {
      self.authed = false
      self.removeUsernameAndPasswordFromStorage()
      icon.updateTooltip()
      if(afterLogout) afterLogout()
    })
  }

  return self
}
