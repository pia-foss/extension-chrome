import React, {Component} from 'react';
import PropType from 'prop-types';

import Checkbox from '../checkbox/index';

class PopularRule extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onChange = this.onChange.bind(this);

    // Initialization
    const defaultName = props.defaultName;
    const bypasslist = props.app.util.bypasslist;
    this.state = { checked: bypasslist.isRuleEnabled(defaultName) };
  }

  onChange ({ target: { checked }}) {
    const { defaultName, app: { util: { bypasslist }}} = this.props;
    if (checked) { bypasslist.enablePopularRule(defaultName); }
    else { bypasslist.disablePopularRule(defaultName); }
    this.setState(() => ({ checked: bypasslist.isRuleEnabled(defaultName) }));
  }

  render () {
    return (
      <li className="list-group-item col-xs-4 popular-rule">
        <label htmlFor={this.props.defaultName} className="noselect col-xs-8 popular-rule-name">
          {this.props.defaultName}
        </label>
        <Checkbox
          className="col-xs-2"
          checked={this.state.checked}
          id={this.props.defaultName}
          onChange={this.onChange}
        />
      </li>
    );
  }
}

PopularRule.propTypes = {
  defaultName: PropType.string.isRequired,
  app: PropType.object.isRequired,
};

export default PopularRule;
