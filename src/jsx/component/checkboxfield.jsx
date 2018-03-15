export default function(renderer, app) {
  const React   = renderer.react,
        settings = app.util.settings;

  class CheckboxField extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        name: this.props.name,
        labelLocaleKey: this.props.labelLocaleKey,
        isChecked: this.props.remember && settings.getItem(this.props.name),
        remember: this.props.remember
      }
    }

    onChange(e) {
      const isChecked = e.target.checked;
      if(this.state.remember)
        settings.setItem(this.state.name, isChecked)
      this.setState({isChecked})
    }

    render() {
      const name           = this.state.name,
            labelLocaleKey = this.state.labelLocaleKey,
            isChecked      = this.state.isChecked;
      return (
        <label className={name}>
          <input name={name}
                 onChange={this.onChange.bind(this)}
                 checked={isChecked}
                 className="checkbox"
                 type="checkbox"/>
          {t(labelLocaleKey)}
        </label>
      )
    }
  }

  return CheckboxField
}
