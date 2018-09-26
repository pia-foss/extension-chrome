import React from 'react';
import PropType from 'prop-types';

const buildClassName = (postfix, id, ...others) => {
  let classNames = [`checkbox-${postfix}`];
  if (id) {
    classNames = [...classNames, `${id}-${postfix}`];
  }
  classNames = [...classNames, ...others];

  return classNames.join(' ');
};

/**
 * Presentational checkbox
 *
 * Used to enforce one, accessible style application wide.
 *
 * Use of styled label overtop of <input type="checkbox" />
 * is to maintain consistency with the Firefox extension.
 *
 * On Firefox done to prevent styling of native checkbox by GTK
 * theme on Linux. Without this, using some GTK themes cause
 * varying appearances for checkboxes, even to the point of
 * them not being visible at all.
 *
 * @param {*} props React props
 *
 * @returns {React.StatelessComponent} Component
 */
const Checkbox = (props) => {
  const {
    id,
    className,
    onChange,
    checked,
  } = props;

  return (
    <div className={buildClassName('container', id, className)}>
      <input
        checked={checked}
        id={id}
        name={id}
        onChange={onChange}
        className={buildClassName('input', id)}
        type="checkbox"
      />
      <label
        htmlFor={id}
        className={buildClassName('label', id)}
      />
    </div>
  );
};

Checkbox.propTypes = {
  id: PropType.string.isRequired,
  className: PropType.string,
  onChange: PropType.func,
  checked: PropType.bool.isRequired,
};

export default Checkbox;
