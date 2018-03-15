import initRegionViewToggles from 'component/regionviewtoggles'

export default function(renderer, app, window, document) {
  const React             = renderer.react,
        RegionViewToggles = initRegionViewToggles(renderer, app, window, document)

  return class PageTitle extends React.Component {
    constructor(props) {
      super(props)
      this.state = props
      this.onKeyPressed = ((event) => {
        const currentType   = document.activeElement.type,
              ignoredFields = ["textarea", "text"]
        if(ignoredFields.indexOf(currentType) < 0 && event.keyCode === 37)
          this.renderPreviousTemplate()
      }).bind(this)
    }

    componentDidMount() {
      document.addEventListener('keydown', this.onKeyPressed)
    }

    componentWillUnmount() {
      document.removeEventListener('keydown', this.onKeyPressed)
      this.onKeyPressed = null
    }

    renderPreviousTemplate() {
      renderer.renderTemplate(this.state.previousTemplate || renderer.previousTemplate)
    }

    render() {
      return(
        <div className="header">
          <div className="back-row">
            <div className="col-xs-2">
              <div className="back-icon" onClick={this.renderPreviousTemplate.bind(this)} />
            </div>
            <div className="col-xs-8 upcase text">
              {this.props.text}
            </div>
          </div>
          {this.regionViewToggles()}
        </div>
      )
    }

    regionViewToggles() {
      if(renderer.currentTemplate === 'change_region')
        return(<RegionViewToggles/>)
      else
        return false
    }

  }

}
