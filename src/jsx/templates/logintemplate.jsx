import initLoginForm   from 'component/loginform'
import initCompanyLogo from 'component/companylogo'

export default function(renderer, app, window, document) {
  const React       = renderer.react,
        LoginForm   = initLoginForm(renderer, app, window, document),
        CompanyLogo = initCompanyLogo(renderer, app, window, document)

  class LoginTemplate extends React.Component {
    constructor(props) {
      super(props)
    }

    joinURL() {
      let joinURL = t("JoinURL")
      if(joinURL.slice(-1) !== "/") joinURL = joinURL + "/"
      return joinURL + app.buildinfo.coupon
    }

    render() {
      return (
        <div id="login-template">
          <CompanyLogo/>
          <div className="top-border">
            <LoginForm/>
          </div>
          <div className="top-border">
            <div className="text-center dont-have-an-account">{t("NoAccountQuestion")}</div>
            <div className="join-PIA">
              <div className="col-xs-1"></div>
              <a className="col-xs-10 btn-info btn-signup" target="_blank" href={this.joinURL()}>{t("JoinText")}</a>
            </div>
          </div>
        </div>
      )
    }
  }

  return LoginTemplate
}
