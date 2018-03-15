export default function(renderer, app) {
  const self   = this,
        React  = renderer.react,
        {chromesettings, contentsettings} = app,
        {proxy} = app,
        {settings, regionlist} = app.util

  return class SettingItem extends React.Component {
    constructor(props) {
      super(props)
      this.state = props
    }

    render() {
      const {id} = this.state,
            controllable = this.isControllable(),
            isChecked = controllable && settings.getItem(id)
      return (
        <div className='field settingitem noselect'>
          <div className='col-xs-10 settingblock'>
            {this.label()}
          </div>
          <div className="col-xs-2 checkmarkcontainer">
            <input onChange={(this.toggle).bind(this)} disabled={!controllable} checked={isChecked} type="checkbox" id={id}/>
            <label className="checkboxlabel" for={id}></label>
          </div>
        </div>
      )
    }

    warningSpan() {
      const {setting}  = this.state,
            localeKeys = new Map([["controlled_by_other_extensions", "SettingControlledByOther"], ["not_controllable", "SettingNotControllable"]])
      if(!this.isControllable())
        return (<span className="errorsubline">{t(localeKeys.get(setting.getLevelOfControl()))}</span>)
    }

    label() {
      const {id,label,tooltip} = this.state,
            href      = this.state.learnMoreHref || "#",
            learnMore = this.state.learnMore || "",
            target    = href === "#" ? undefined : "_blank",
            classNames = this.isControllable() ? "" : "uncontrollable-setting"
      return (
        <div>
          <a className="macetooltip">
            <label htmlFor={id}className={classNames}>{label}
              <div className="popover arrow-bottom">{tooltip}</div>
            </label>
          </a>
          {this.warningSpan()}
          <div className={id}>
            <a className="learnmore" href={href} target={target}>{learnMore}</a>
          </div>
        </div>
      )
    }

    toggle() {
      const id = this.state.id,
            onComplete = (setting) => {
              settings.setItem(id, setting.isApplied())
              if(setting.isApplied())
                this.props.parent.setState({enabledCount: this.props.parent.getEnabledCount() + 1})
              else
                this.props.parent.setState({enabledCount: this.props.parent.getEnabledCount() - 1})
            },
            toggleID = (id) => {
              settings.setItem(id, !settings.getItem(id))
              this.props.parent.setState({enabledCount: this.props.parent.getEnabledCount()})
            },
            toggle = (id, setting) => {
              if(setting.alwaysActive || proxy.enabled())
                if(setting.isApplied())
                  setting.clearSetting().then(onComplete).catch(onComplete)
                else
                  setting.applySetting().then(onComplete).catch(onComplete)
              else
                toggleID(id)
            }
      for(let k in contentsettings)
        if(id === contentsettings[k].settingID)
          return toggle(id, contentsettings[k])
      for(let k in chromesettings)
        if(id === chromesettings[k].settingID)
          return toggle(id, chromesettings[k])
      switch(id) {
        case "maceprotection":
          toggleID(id)
          if(proxy.enabled())
            proxy.enable(regionlist.getSelectedRegion())
          break
        case "debugmode":
          toggleID(id)
          if(!settings.getItem(id)) app.logger.removeEntries()
          debug("debug mode: enabled.", () => settings.getItem(id))
          break
        default:
          toggleID(id)
          break
      }
    }

    isControllable() {
      return this.state.controllable === undefined || this.state.controllable
    }
  }
}
