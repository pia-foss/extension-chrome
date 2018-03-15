import initBypassItem from 'component/bypasslist/bypassitem'

export default function(renderer, app, window, document) {
  const React = renderer.react,
        {proxy} = app,
        {bypasslist,regionlist} = app.util,
        BypassItem = initBypassItem(renderer, app, window, document)

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {contents: bypasslist.getUserRules()}
    }

    render() {
      const {contents} = this.state,
            rows = []
      return(
        <div>
          <h3 className="bl_sectionheader">{t("OtherWebsites")}</h3>
          <form action="#" className="add-container">
            <input type="text" name="rule" className="add-bar" placeholder={t("AddUrlToBypassList")}></input>
            <input type="submit" className="add-btn" value="+" onClick={this.save.bind(this)}></input>
          </form>
          <div className="otherlist">
            {bypasslist.getUserRules().map((rule) => <BypassItem rule={rule}/>)}
          </div>
        </div>
      )
    }

    save(event) {
      event.preventDefault()
      bypasslist.addUserRule(document.querySelector("input[name='rule']").value)
      if(proxy.enabled())
        proxy.enable(regionlist.getSelectedRegion())
      renderer.renderTemplate("bypasslist")
    }
  }
}
