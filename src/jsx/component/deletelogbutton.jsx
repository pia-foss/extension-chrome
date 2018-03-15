export default function(renderer, app, window, document) {
  const React = renderer.react,
        logger = app.logger

  return class DeleteLogButton extends React.Component {
    constructor(props) {
      super(props)
    }

    onClick(event) {
      event.preventDefault()
      logger.removeEntries()
      this.props.parentComponent.setState({entries: []})
    }

    render() {
      return (
          <div className="col-xs-5 dldeletebtn">
            <button className="col-xs-12 btn btn-danger" onClick={this.onClick.bind(this)}>
              {t("DeleteDebugLog")}
            </button>
          </div>
      )
    }
  }
}
