import React from 'react';
import PropTypes from 'prop-types';

const LoginField = ({
  name,
  type,
  theme,
  localeKey,
  autocomplete,
  onChange,
  defaultValue,
  autoFocus,
}) => {
  return (
    <input
      name={name}
      type={type}
      maxLength="253"
      onChange={onChange}
      placeholder={t(localeKey)}
      defaultValue={defaultValue}
      autoComplete={autocomplete || 'on'}
      className={`login-input ${theme}`}
      // If an autofocus action can be anticipated, it
      // has been said by users to not break accessibility
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
    />
  );
};

LoginField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  localeKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  autocomplete: PropTypes.string,
  defaultValue: PropTypes.string,
  autoFocus: PropTypes.bool,
};

LoginField.defaultProps = {
  autoFocus: false,
  autocomplete: '',
  defaultValue: '',
};

export default LoginField;
