export default function(app) {
  return function(msg, sender, sendResponse) {
    switch(msg.request) {
    case "RequestCredentials": {
      const {user,i18n} = app.util,
            domains = i18n.domainMap.values(),
            allowedUrls = Array.from(domains).map((v) => `https://${v}/xpages/sign-in`)
      if(user.authed && allowedUrls.includes(msg.url))
        sendResponse({user: user.username(), pass: user.password()})
      break
    }
    case "RequestErrorInfo": {
      const errorinfo = app.util.errorinfo
      sendResponse(errorinfo.get(msg.id))
      break
    }
    case "RequestErrorDelete": {
      const errorinfo = app.util.errorinfo
      errorinfo.delete(msg.id)
      break
    }
    case "t": {
      const {i18n} = app.util,
            m = i18n.t(msg.localeKey)
      sendResponse({m})
    }
    default:
      break
    }
  }
}
