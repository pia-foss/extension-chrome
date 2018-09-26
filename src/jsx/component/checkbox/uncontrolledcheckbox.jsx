import React, {Component} from 'react';
import PropType from 'prop-types';

import Checkbox from '.';

/**
 * Uncontrolled version of Checkbox
 *
 * Manages checked status internally. Used instead of
 * uncontrolled <input type="checkbox" /> in order to
 * share same style as other checkboxes in application.
 */
class UncontrolledCheckbox extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onChange = this.onChange.bind(this);

    // Init
    const checked = typeof props.defaultChecked === 'undefined' ? false : props.defaultChecked;
    this.state = {checked};
  }

  onChange () {
    this.setState(({checked}) => ({checked: !checked}));
  }

  componentDidUpdate (prevState) {
    if (prevState.checked !== this.state.checked) {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this.state.checked);
      }
    }
  }

  render () {
    const {
      id,
      className,
    } = this.props;

    return (
      <Checkbox
        id={id}
        className={className}
        checked={this.state.checked}
        onChange={this.onChange}
      />
    );
  }
}

UncontrolledCheckbox.propTypes = {
  id: PropType.string.isRequired,
  className: PropType.string,
  defaultChecked: PropType.bool,
  onChange: PropType.func,
};

export default UncontrolledCheckbox;
