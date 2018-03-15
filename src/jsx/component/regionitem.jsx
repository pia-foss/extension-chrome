import onSwitchRegion  from 'eventhandler/templates/changeregion/onswitchregion'
import onFlagError     from 'eventhandler/templates/changeregion/onflagerror'

export default function(renderer, app, window, document) {
  const React = renderer.react

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {region: this.props.region}
    }

    onClick(event) {
      new onSwitchRegion(renderer, app).handler(this.state.region)
    }

    onFlagLoadError(event) {
      new onFlagError(renderer, app).handler(event, this.state.region)
    }

    latencyColor(latency) {
      if(latency <= 150) {
        return "latency-green"
      } else if(latency <= 500) {
        return "latency-orange"
      } else {
        return "latency-red"
      }
    }
  }
}
