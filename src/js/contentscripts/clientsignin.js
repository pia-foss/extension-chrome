(new function(window, document) {
  const {href} = document.location,
        formfieldQuery = "div#control_panel_signin_container form",
        userfieldQuery = `${formfieldQuery} input[name=user]`,
        passfieldQuery = `${formfieldQuery} input[name=pass]`

  document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({request: 'RequestCredentials', url: href}, (response) => {
      if(chrome.runtime.lastError || !response)
        return
      const userfield = document.querySelector(userfieldQuery),
            passfield = document.querySelector(passfieldQuery),
            formfield = document.querySelector(formfieldQuery)
      if(userfield && passfield && formfield) {
        userfield.value = response.user
        passfield.value = response.pass
        formfield.submit()
      }
    })
  })
}(window, document))
