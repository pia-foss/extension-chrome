export default function(renderer, app, window, document) {
  const React = renderer.react;
  const {proxy} = app;
  const {bypasslist,regionlist} = app.util;
  const createRandomID = (label) => {
    let id = "_";
    for(let i = 0; i < label.length; i++) {
      id += label.charCodeAt(i) || Math.ceil(Math.random()*1000);
    }
    return id;
  };

  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {rule: props.rule, ruleID: createRandomID(props.rule)};
    }

    render() {
      const {ruleID,rule} = this.state;
      return (
        <div id={ruleID} className="otherbypassitem">
          <span className="name">{rule}</span>
          <span className="rem" onClick={this.removeRule.bind(this)}></span>
        </div>
      )
    }

    removeRule() {
      const {ruleID} = this.state;
      const sel = document.querySelector(`div#${ruleID}`);
      bypasslist.removeUserRule(this.state.rule);
      sel.parentNode.removeChild(sel);
      if(proxy.enabled()) {
        proxy.enable(regionlist.getSelectedRegion());
      }
      renderer.renderTemplate("bypasslist");
    }
  }
}
