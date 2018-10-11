import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({
  message,
  orientation,
}) => {
  switch (orientation) {
    case 'bottom':
    case 'top':
    case 'right':
      break;

    default: throw new Error(`invalid orientation: ${orientation}`);
  }

  const className = `popover arrow-${orientation}`;

  return (
    <div className={className}>
      { message }
    </div>
  );
};

Tooltip.propTypes = {
  message: PropTypes.string.isRequired,
  orientation: PropTypes.string,
};

Tooltip.defaultProps = {
  orientation: 'bottom',
};

export default Tooltip;
