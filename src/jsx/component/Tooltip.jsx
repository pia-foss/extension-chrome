import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({ theme, message, orientation }) => {
  switch (orientation) {
    case 'bottom':
    case 'right':
    case 'top':
      break;

    default: throw new Error(`invalid orientation: ${orientation}`);
  }

  return (
    <div className={`popover arrow-${orientation} ${theme}`}>
      { message }
    </div>
  );
};

Tooltip.propTypes = {
  orientation: PropTypes.string,
  theme: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

Tooltip.defaultProps = {
  orientation: 'bottom',
};

export default Tooltip;
