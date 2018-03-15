export default function(renderer, app) {
  const self  = this,
        React = renderer.react,
        createRandomID = (label) => {
          let id = "_"
          for(let i = 0; i < label.length; i++)
            id += label.charCodeAt(i) || Math.ceil(Math.random()*1000)
          return id
        }

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {label: this.props.label, enabledCount: 0, randomID: createRandomID(this.props.label)}
    }

    toggleSection(event) {
      let target = event.target
      while(!target.classList.contains("sectionwrapper"))
        target = target.parentNode
      target.classList.contains("open") ? target.classList.remove("open") : target.classList.add("open")
    }

    getEnabledCount() {
      return document.querySelectorAll(`div#${this.state.randomID} input[type='checkbox']:checked`).length
    }

    getTotalCount() {
      return document.querySelectorAll(`div#${this.state.randomID} input[type='checkbox']`).length
    }

    componentDidMount() {
      this.setState({enabledCount: this.getEnabledCount(), totalCount: this.getTotalCount()})
    }

    render() {
      const totalCount = this.state.totalCount || this.getTotalCount(),
            {label, enabledCount, randomID} = this.state
      return (
        <div id={randomID}>
          <div className='firstfield field' onClick={this.toggleSection.bind(this)}>
            <div className='col-xs-12 settingblock settingheader noselect'>
              <span className="sectiontitle col-xs-6">{label}</span>
              <div className="rightalign">
                <span className="counts">{enabledCount}/{totalCount} {t("enabled")}</span>
                <span className="expandicon"></span>
              </div>
            </div>
          </div>
          <div className="SettingItemContainer">
            {React.Children.map(this.props.children, (c) => React.cloneElement(c, {parent: this}))}
          </div>
        </div>
      )
    }
  }
}
