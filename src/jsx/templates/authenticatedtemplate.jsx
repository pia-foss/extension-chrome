import initSwitch        from 'component/switch'
import initCurrentRegion from 'component/currentregion'
import initActionButton  from 'component/actionbutton'
import initCompanyLogo   from 'component/companylogo'
import initSettingsIcon  from 'component/settingsicon'

export default function(renderer, app, window, document) {
  const React         = renderer.react,
        CurrentRegion = initCurrentRegion(renderer, app, window, document),
        ActionButton  = initActionButton(renderer, app, window, document),
        Switch        = initSwitch(renderer, app, window, document),
        CompanyLogo   = initCompanyLogo(renderer, app, window, document),
        SettingsIcon  = initSettingsIcon(renderer, app, window, document),
        {proxy} = app,
        {regionlist, i18n, user} = app.util,
        logout = () => {
          return user.logout(() => renderer.renderTemplate("login"))
        }

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {region: regionlist.getSelectedRegion()}
    }

    autologinURL() {
      return `https://${i18n.domain()}/xpages/sign-in`
    }

    render() {
      return(
        <div id="authenticated-template" className="row">
          <CompanyLogo/>
          <div className="connection">
	    <div>
	      <Switch isOn={proxy.enabled()}/>
	    </div>
	    <div>
	      <CurrentRegion id="region" region={this.state.region}/>
	    </div>
	    <div className="external-buttons">
              <SettingsIcon/>
              <a title={t("AccountSettingsText")} className="col-xs-4 btn-icon btn-account invokepop" href={this.autologinURL()} target="_blank"><div className="popover darkpopover arrow-bottom">{t("AccountSettingsText")}</div></a>
              <a title={t("SupportText")} className="col-xs-4 btn-icon btn-help" href={"https://www.privateinternetaccess.com/helpdesk/"} target="_blank"><div className="popover darkpopover arrow-bottom">{t("SupportText")}</div></a>
              <ActionButton extraClassList="col-xs-3 btn-icon btn-logout" title={t("LogoutText")} tooltip={t("LogoutText")} callback={logout}/>
	    </div>
          </div>
        </div>
      )
    }
  }
}
