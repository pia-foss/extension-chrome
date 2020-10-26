import React from 'react';
import PropTypes from 'prop-types';

function LabelledInput(props) {
  const {
    name,
    placeholder,
    text,
    className,
    onChange,
    type,
    value,
  } = props;
  const inputID = `${name}-override-input`;

  return (
    <label className={className} htmlFor={inputID}>
      { text }
      <input
        name={name}
        onChange={onChange}
        id={inputID}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

LabelledInput.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

LabelledInput.defaultProps = {
  className: undefined,
  onChange: () => {},
  type: 'text',
  placeholder: undefined,
};

export default LabelledInput;
