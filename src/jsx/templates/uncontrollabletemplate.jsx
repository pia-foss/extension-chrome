import initCompanyLogo from 'component/companylogo'

export default function(renderer, app, window, document) {
  const React       = renderer.react,
        CompanyLogo = initCompanyLogo(renderer, app, window, document)

  class UncontrollableTemplate extends React.Component {
    openExtensionsPage() {
      chrome.tabs.create({url: "chrome://extensions"});
    }

    render() {
      return (
        <div>
          <CompanyLogo/>
          <div className="top-border">
            <div className="warningicon"></div>
            <p className="warningtext">
              {t("CannotUsePIAMessage")}
            </p>
            <p className="btn-center">
              <a className="btn btn-success" href="#" onClick={this.openExtensionsPage.bind(this)}>{t("ManageExtensions")}</a>
            </p>
          </div>
        </div>
      )
    }
  }

  return UncontrollableTemplate
}
