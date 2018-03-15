import onFlagError from "eventhandler/templates/changeregion/onflagerror"

export default function(renderer, app) {
  const React = renderer.react

  class CurrentRegion extends React.Component {
    constructor(props) {
      super(props)
      this.state = {region: props.region}
    }

    onFlagLoadError(event) {
      new onFlagError(renderer, app).handler(event, this.state.region)
    }

    render() {
      const {id,flag} = this.state.region,
            localizedName = this.state.region.localizedName()
      return (
        <div
            data-current-region-id={id}
            id='region'
            className='block'
            onClick={() => renderer.renderTemplate("change_region")}
        >
          <div id="go-forward-image" className='select'></div>
          <div className='flag'><img onError={this.onFlagLoadError.bind(this)} src={flag}/></div>
          <div className='title'>{t("CurrentRegionText")}</div>
          <div className='name'>{localizedName}</div>
        </div>
      )
    }
  }

  return CurrentRegion
}
