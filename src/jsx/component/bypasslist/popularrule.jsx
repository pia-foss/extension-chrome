export default function(renderer, app, window, document) {
  const React = renderer.react,
        {bypasslist} = app.util

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {name: props.name, checked: bypasslist.isRuleEnabled(props.name)}
    }

    render() {
      const {checked, name} = this.state
      return (
        <li style={{padding: "5px"}} className="list-group-item col-xs-4 popular-rule">
          <label
              style={{textTransform: "capitalize"}}
              htmlFor={name}
              className="noselect col-xs-8">
            {name}
          </label>
           <div className="col-xs-2 checkmarkcontainer">
            <input
              onChange={this.toggleCheckbox.bind(this)}
              id={name}
              checked={checked}
              type="checkbox"
            />
            <label className="checkboxlabel" htmlFor={name}></label>
          </div>
        </li>
      )
    }

    toggleCheckbox(event) {
      const {target} = event,
            name = target.getAttribute("id")
      if(target.checked)
        bypasslist.enablePopularRule(name)
      else
        bypasslist.disablePopularRule(name)
      this.setState({checked: target.checked})
    }
  }
}
