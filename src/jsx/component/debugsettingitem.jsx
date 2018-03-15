export default function(renderer, app) {
  const self   = this,
        React  = renderer.react

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = props
    }

    onClick(event) {
      event.preventDefault()
      renderer.renderTemplate("debuglog")
    }

    render() {
      return (
        <div className='field settingitem noselect'>
          <div className="col-xs-12 dlviewbtn">
            <button className="col-xs-12 btn btn-success" onClick={this.onClick.bind(this)}>
              {t("ViewDebugLog")}
            </button>
          </div>
        </div>
      )
    }
  }
}
