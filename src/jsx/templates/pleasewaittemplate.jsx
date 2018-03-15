import initCompanyLogo from 'component/companylogo'

export default function(renderer, app, window, document) {
  const React       = renderer.react,
        CompanyLogo = initCompanyLogo(renderer, app, window, document)

  return class extends React.Component {
    render() {
      return (
        <div id="please-wait-template">
          <CompanyLogo/>
          <div className="top-border">
            <div className="loader"></div>
            <p className="loadingtext2">
              {t("PleaseWait")}
            </p>
          </div>
        </div>
      )
    }
  }
}
