import initStatusText from 'component/statustext'

export default function(renderer, app, window, document) {
  const React   = renderer.react,
        {proxy} = app,
        StatusText = initStatusText(renderer, app, window, document)

  class Switch extends React.Component {
    constructor(props) {
      super(props)
      this.state = {enabled: proxy.enabled()}
    }

    onChange() {
      const {regionlist} = app.util,
            onComplete = (proxy) => this.setState({enabled: proxy.enabled()})
      if(proxy.enabled())
        proxy.disable().then(onComplete)
      else
        proxy.enable(regionlist.getSelectedRegion()).then(onComplete)
    }

    componentDidMount() {
      const checked   = document.createElement("style"),
            unchecked = document.createElement("style")
      checked.innerHTML   = ".switch:checked::after {content:'ON'}"
      unchecked.innerHTML = ".switch::after {content:'OFF'}"
      document.body.appendChild(checked)
      document.body.appendChild(unchecked)
    }

    render() {
      const enabled = this.state.enabled
      return (
        <div>
          <StatusText enabled={enabled}/>
          <div className="switch-container">
            <input type="checkbox" className="switch" checked={enabled} disabled={false} onChange={this.onChange.bind(this)}/>
          </div>
        </div>
      )
    }
  }

  return Switch
}
