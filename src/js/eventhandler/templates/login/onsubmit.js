const showElement = (element) => {
  element.classList.remove('hidden')
}

const hideElement = (element) => {
  element.classList.add('hidden')
}

const handleHttpError = (xhr, errorDiv) => {
  switch(xhr.status) {
  case 401:
    return errorDiv.innerHTML = t("WrongUsernameAndPassword")
  case 429:
    return errorDiv.innerHTML = t("TooManyRequestsError")
  default:
    return errorDiv.innerHTML = t("UnexpectedServerResponse", {statusLine: `${xhr.status} ${xhr.statusText}`})
  }
}

export default function(renderer, app, window, document) {
  const {user,regionlist} = app.util,
        requestOK = (xhr) => {
          if(regionlist.synced)
            renderer.renderTemplate("authenticated")
          else
            regionlist.sync().then(() => {
              renderer.renderTemplate("authenticated")
            }).catch(() => {
              user.logout(() => renderer.renderTemplate("login"))
            })
        },
        requestError = (xhr) => {
          const errorDiv   = document.querySelector(".text-danger"),
                loaderIcon = document.querySelector(".loader"),
                submitBtn  = document.querySelector("#submit-form-button")
          hideElement(loaderIcon)
          showElement(submitBtn)
          showElement(errorDiv)
          switch(xhr.tinyhttp.cause) {
          case "status":
            /* request complete but got something other than 200 status code */
            return handleHttpError(xhr, errorDiv)
          case "abort":
            /* request aborted (xhr.abort(), third-party extension using return {cancel: true}) */
            return errorDiv.innerHTML = t("AbortError")
          case "networkerror":
            /* network error while making request */
            return errorDiv.innerHTML = window.navigator.onLine ? t("NetworkError") : t("OfflineError")
          case "timeout":
            /* request expired */
            return errorDiv.innerHTML = t("TimeoutError", {seconds: user.authTimeout/1000})
          }
        }

  this.handler = (event) => {
    event.preventDefault()
    const submitBtn  = document.querySelector("#submit-form-button"),
          loaderIcon = document.querySelector(".loader")
    hideElement(submitBtn)
    showElement(loaderIcon)
    user.auth().then(requestOK).catch(requestError)
  }

  return this
}
