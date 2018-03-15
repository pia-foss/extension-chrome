export default function(renderer, app, window, document) {
  const React = renderer.react

  return class extends React.Component {
    render() {
      const {bypasslist} = app.util,
            ruleCount = this.getRuleCount(bypasslist.visibleSize())
      return(
        <div>
          <div className='firstfield field' onClick={() => renderer.renderTemplate("bypasslist")}>
            <div className='col-xs-12 settingblock settingheader noselect'>
              <span className="sectiontitle col-xs-6">{t("ProxyBypassList")}</span>
              <div className="rightalign">
                <span className='counts'>{ruleCount}</span>
                <span className="expandicon lefticon"></span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    getRuleCount(count) {
      if(count === 0)
        return t("NoRulesAdded")
      else if(count === 1)
        return t("OneRuleAdded")
      else
        return t("MultipleRulesAdded", {count})
    }
  }
}
