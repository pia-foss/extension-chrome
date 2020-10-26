import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '@hoc/errorboundary';

const buildClassName = (postfix, id, ...others) => {
  let classNames = [`checkbox-${postfix}`];
  if (id) { classNames.push(`${id}-${postfix}`); }
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
    theme,
    className,
    checked,
    disabled,
    onChange,
  } = props;

  return (
    <div className={buildClassName('container', id, className)}>
      <input
        id={id}
        name={id}
        onChange={onChange}
        className={buildClassName(
          'input',
          id,
          ...(disabled ? ['disabled'] : []),
        )}
        type="checkbox"
        checked={checked}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={buildClassName('facade', id, theme)}
      />
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

Checkbox.defaultProps = {
  className: '',
  disabled: false,
};

export default ErrorBoundary(Checkbox);
