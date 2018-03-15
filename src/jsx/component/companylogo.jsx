export default function(renderer, app) {
  const React = renderer.react;

  class CompanyLogo extends React.Component {
    render() {
      return(
        <div id="company-logo" className="row">
          <div className="col-xs-12 text-center">
            <img src="/images/logo@2x.png" alt="Private Internet Access Logo" width="210" title="Private Internet Access"/>
          </div>
        </div>
      )
    }
  }

  return CompanyLogo
}
