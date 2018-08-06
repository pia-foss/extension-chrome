import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({message}) => {
  return <div className="popover arrow-bottom">{message}</div>;
};

Tooltip.propTypes = {
  message: PropTypes.string.isRequired,
};

export default Tooltip;
