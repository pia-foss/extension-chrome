import PropType from 'prop-types';
import React, { Component } from 'react';
import Checkbox from '.';

/**
 * Uncontrolled version of Checkbox
 *
 * Manages checked status internally. Used instead of
 * uncontrolled <input type="checkbox" /> in order to
 * share same style as other checkboxes in application.
 */
class UncontrolledCheckbox extends Component {
  constructor(props) {
    super(props);

    // properties
    this.state = { checked: props.defaultChecked };

    // bindings
    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(prevState) {
    const { checked } = this.state;
    const { onChange } = this.props;

    if (prevState.checked !== checked) {
      onChange(checked);
    }
  }

  onChange() {
    const { checked } = this.state;
    this.setState(({ checked: !checked }));
  }

  render() {
    const { checked } = this.state;
    const { id, className } = this.props;

    return (
      <Checkbox
        id={id}
        className={className}
        checked={checked}
        onChange={this.onChange}
      />
    );
  }
}

UncontrolledCheckbox.propTypes = {
  id: PropType.string.isRequired,
  className: PropType.string,
  defaultChecked: PropType.bool,
  onChange: PropType.func.isRequired,
};

UncontrolledCheckbox.defaultProps = {
  className: '',
  defaultChecked: false,
};

export default UncontrolledCheckbox;
