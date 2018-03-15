export default function(renderer, app) {
  const React    = renderer.react,
        storage  = app.util.storage,
        settings = app.util.settings,
        user     = app.util.user,
        i18n     = chrome.i18n

  class InputField extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        storageKey: this.props.storageKey,
        localeKey: this.props.localeKey,
        type: this.props.type,
        autocomplete: this.props.autocomplete || "on"
      }
    }

    handleKeyPress(e) {
      storage.setItem(this.state.storageKey, e.target.value, user.storageBackend())
    }

    render() {
      const storageBackend  = user.storageBackend(),
            storageKey      = this.state.storageKey,
            localeKey       = this.state.localeKey,
            type            = this.state.type,
            autocomplete    = this.state.autocomplete
      return (
        <input name={storageKey}
               autoComplete={autocomplete}
               onChange={this.handleKeyPress.bind(this)}
               defaultValue={storage.getItem(storageKey, storageBackend)}
               placeholder={i18n.getMessage(localeKey)}
               className="pia-form-control form-control"
               type={type}
        />)
    }
  }

  return InputField
}
