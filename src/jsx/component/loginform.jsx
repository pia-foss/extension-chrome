import initInputField      from 'component/inputfield'
import initCheckboxField   from 'component/checkboxfield'
import initRememberMeField from 'component/remembermefield'
import onSubmit            from 'eventhandler/templates/login/onsubmit'

export default function(renderer, app, window, document) {
  const React           = renderer.react,
        InputField      = initInputField(renderer, app),
        RememberMeField = initRememberMeField(renderer, app)

  class LoginForm extends React.Component {
    handleSubmit(event) {
      new onSubmit(renderer, app, window, document).handler(event)
    }

    resetPasswordURL() {
      const {i18n} = app.util
      return `https://${i18n.domainMap.get(i18n.locale)}/pages/reset-password`
    }

    render() {
      return (
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div className="col-xs-1"></div>
          <div className="col-xs-10">
            <div className="text-danger bottom-gap col-xs-12 hidden"></div>
            <div className="form-group">
              <InputField autocomplete="off" remember={true} storageKey="form:username" localeKey="UsernamePlaceholder" type="text"/>
            </div>
            <div className="form-group">
              <InputField autocomplete="off" remember={true} storageKey="form:password" localeKey="PasswordPlaceholder" type="password"/>
            </div>
            <div className="form-group">
              <RememberMeField remember={true} name="rememberme" labelLocaleKey="RememberMe"/>
            </div>
            <div className="form-group text-center">
              <button id="submit-form-button" type="submit" className="upcase-bold btn-success form-control">
                {t('LoginText')}
              </button>
              <div className="resetpw text-center">
            		<a href={this.resetPasswordURL()} target="_blank">
            		  {t("ResetPasswordText")}
            		</a>
  	          </div>
              <div className="loader login-loader hidden"></div>
            </div>
          </div>
        </form>
      )
    }
  }

 return LoginForm
}
