import LoginField           from 'component/loginfield';
import initRememberMeField  from 'component/remembermefield';
import onSubmit             from 'eventhandler/templates/login/onsubmit';

export default function(renderer, app, window, document) {
  const React           = renderer.react,
        RememberMeField = initRememberMeField(renderer, app);

  class LoginForm extends React.Component {
    constructor(props) {
      super(props);

      // bindings
      this.onInputChange = this.onInputChange.bind(this);
    }
    handleSubmit(event) {
      new onSubmit(renderer, app, window, document).handler(event);
    }

    resetPasswordURL() {
      const {i18n} = app.util;
      return `https://${i18n.domainMap.get(i18n.locale)}/pages/reset-password`
    }

    onInputChange({target: {value, name}}) {
      const {user} = app.util;
      switch (name) {
        case 'username': {
          user.setUsername(value);
          break;
        }

        case 'password': {
          user.setPassword(value);
          break;
        }

        default: {
          console.error(debug(`invalid name for login field: ${value}`));
        }
      }
    }

    render() {
      const {user} = app.util;

      return (
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div className="col-xs-1"></div>
          <div className="col-xs-10">
            <div className="text-danger bottom-gap col-xs-12 hidden"></div>
            <div className="form-group">
            <LoginField
                autocomplete="off"
                name="username"
                type="text"
                localeKey="UsernamePlaceholder"
                defaultValue={user.getUsername()}
                onChange={this.onInputChange}
              />
            </div>
            <div className="form-group">
            <LoginField
                autocomplete="off"
                name="password"
                type="password"
                localeKey="PasswordPlaceholder"
                defaultValue={user.getPassword()}
                onChange={this.onInputChange}
              />
            </div>
            <div className="form-group">
              <RememberMeField remember={true} name="rememberme" labelLocaleKey="RememberMe"/>
            </div>
            <div className="form-group text-center">
              <button id="submit-form-button" type="submit" className="upcase-bold btn-success form-control">
                {t('LoginText')}
              </button>
              <div className="resetpw text-center">
            		<a href={this.resetPasswordURL()} target="_blank" rel="noopener noreferrer">
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
