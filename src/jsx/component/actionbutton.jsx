export default function(renderer, app) {
  const React = renderer.react

  class ActionButton extends React.Component {
    constructor(props) {
      super(props)
      this.state = props
    }

    render() {
      const tooltip = this.state.tooltip,
            extraClassList = this.state.extraClassList
      return(
	<a onClick={this.props.callback.bind(this)}
           title={this.props.title}
           className={`${extraClassList} btn btn-external`}>
          {this.props.text}
          <div className="popover darkpopover arrow-bottom">{tooltip}</div></a>
      )
    }
  }

  return ActionButton
};
