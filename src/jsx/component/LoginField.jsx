import React from 'react';
import PropType from 'prop-types';

const LoginField = ({
  name,
  localeKey,
  autocomplete,
  type,
  onChange,
  defaultValue,
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
};

LoginField.defaultProps = {
  autocomplete: '',
  defaultValue: '',
};

export default LoginField;
