import initPageTitle       from 'component/pagetitle'
import initClipboardButton from 'component/clipboardbutton'
import initDeleteLogButton from 'component/deletelogbutton'
import Timestamp           from 'react-timeago'

export default function(renderer, app, window, document) {
  const React           = renderer.react,
        PageTitle       = initPageTitle(renderer, app, window, document),
        ClipboardButton = initClipboardButton(renderer, app, window, document),
        DeleteLogButton = initDeleteLogButton(renderer, app, window, document),
        {logger} = app

  return class DebuglogTemplate extends React.Component {
    constructor(props) {
      super(props)
      this.state = {entries: logger.getEntries()}
      this.handleNewMessage = () => this.setState({entries: logger.getEntries()})
    }

    componentDidMount() {
      logger.addEventListener('NewMessage', this.handleNewMessage)
    }

    componentWillUnmount() {
      logger.removeEventListener('NewMessage', this.handleNewMessage)
      this.handleNewMessage = null
    }

    reloadPage() {
      this.forceUpdate()
    }

    render() {
      const entries = this.state.entries,
	    {platforminfo} = app.util
      if(platforminfo.ready === false) {
	return (
	  <div id="debuglog-template" className="row">
	    <PageTitle text={t("DebugLog")}/>
	    <p className="text-left emptytext still-loading">
	      {t("TheExtensionIsStillLoading")}
	    </p>
	    <div className="col-xs-3"></div>
	    <button className="btn btn-success col-xs-6" onClick={this.reloadPage.bind(this)}>
	      {t("ReloadPage")}
	    </button>
	    <div className="col-xs-3"></div>
	  </div>
	)
      }
      else if(entries.length === 0) {
        return (
          <div id="debuglog-template" className="row">
            <PageTitle text={t("DebugLog")}/>
            <p className="text-center emptytext">
              {t("DebugLogIsEmpty")}
            </p>
          </div>
        )
      } else {
          return (
            <div id="debuglog-template" className="row">
              <PageTitle text={t("DebugLog")}/>
              <div className="col-xs-12">
                <ClipboardButton/>
                <DeleteLogButton parentComponent={this}/>
              </div>
              <ul>
                {this.renderEntries(entries)}
              </ul>
            </div>
          )
        }
    }

    renderEntries(entries) {
      return entries.map((entry) => {
        const [timestamp, message] = entry
        return (
          <li>
            <span style={{wordWrap: 'break-word'}} className="bold">{message}</span>
            <br/>
            <Timestamp live={false} date={timestamp}/>
          </li>
        )
      })
    }

  }
}
