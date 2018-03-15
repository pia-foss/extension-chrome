export default function(renderer, app, window, document) {
  const React = renderer.react,
        logger = app.logger

  return class ClipboardButton extends React.Component {
    constructor(props) {
      super(props)
    }

    copyToClipboard(event) {
      const btn = document.querySelector(".btn"),
	    {platforminfo} = app.util,
            messages = logger.getEntries().map((entry) => {
        const [timestamp, message] = entry
        return message
      }).join(platforminfo.lineEnding())
      event.preventDefault()
      event.clipboardData.setData('Text', messages)
      btn.innerHTML = t("CopiedToClipboard")
      window.setTimeout(() => btn.innerHTML = t("CopyToClipboard"), 500)
    }

    onClick(event) {
      event.preventDefault()
      document.addEventListener('copy', this.copyToClipboard)
      document.execCommand('copy')
      document.removeEventListener('copy', this.copyToClipboard)
    }

    render() {
      return (
          <div className="col-xs-7 dlcopybtn">
            <button className="col-xs-12 btn btn-success" onClick={this.onClick.bind(this)}>
              {t("CopyToClipboard")}
            </button>
          </div>
      )
    }
  }
}
