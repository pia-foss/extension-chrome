import initCheckboxField from 'component/checkboxfield'

export default function(renderer, app) {
  const React         = renderer.react,
        storage       = app.util.storage,
        settings      = app.util.settings,
        CheckboxField = initCheckboxField(renderer, app)

  class RememberMeField extends CheckboxField {
    onChange(e) {
      if(e.target.checked) {
        /* Copy the username and password stored in memory to localStorage */
        storage.setItem("form:username", storage.getItem("form:username", "memoryStorage"), "localStorage")
        storage.setItem("form:password", storage.getItem("form:password", "memoryStorage"), "localStorage")
        /* Forget the username and password stored in memory */
        storage.removeItem("form:username", "memoryStorage")
        storage.removeItem("form:password", "memoryStorage")
        this.setState({isChecked: true})
        settings.setItem("rememberme", true)
      }
      else {
        /* Copy the username and password stored in localStorage to memory */
        const username = storage.getItem("form:username", "localStorage"),
              password = storage.getItem("form:password", "localStorage")
        if(typeof(username) === "string" && username.length > 0 && typeof(password) === "string" && password.length > 0) {
          storage.setItem("form:username", username, "memoryStorage")
          storage.setItem("form:password", password, "memoryStorage")
        }
        /* Forget the username and password stored in localStorage */
        storage.removeItem("form:username", "localStorage")
        storage.removeItem("form:password", "localStorage")
        this.setState({isChecked: false})
        settings.setItem("rememberme", false)
      }
    }
  }

  return RememberMeField
}
