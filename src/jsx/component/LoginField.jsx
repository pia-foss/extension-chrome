import React from 'react';
import PropType from 'prop-types';

const LoginField = ({
  name,
  localeKey,
  autocomplete,
  type,
  onChange,
  defaultValue,
  autoFocus,
}) => {
  return (
    <input
      name={name}
      placeholder={t(localeKey)}
      autoComplete={autocomplete || 'on'}
      type={type}
      onChange={onChange}
      defaultValue={defaultValue}
      className="pia-form-control form-control"
      // If an autofocus action can be anticipated, it
      // has been said by users to not break accessibility
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
    />
  );
};

LoginField.propTypes = {
  name: PropType.string.isRequired,
  type: PropType.string.isRequired,
  localeKey: PropType.string.isRequired,
  onChange: PropType.func.isRequired,
  autocomplete: PropType.string,
  defaultValue: PropType.string,
  autoFocus: PropType.bool,
};

LoginField.defaultProps = {
  autoFocus: false,
  autocomplete: '',
  defaultValue: '',
};

export default LoginField;
