import React from 'react';
import PropTypes from 'prop-types';

const Drawer = (props) => {
  const { theme, open, onToggleDrawer } = props;

  return (
    <div
      role="button"
      tabIndex="-1"
      className={`drawer-handle ${theme}`}
      onClick={onToggleDrawer}
      onKeyPress={onToggleDrawer}
    >
      <div className={`drawer-handle-arrow ${open ? 'open' : ''}`} />
    </div>
  );
};

Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  onToggleDrawer: PropTypes.func.isRequired,
};

export default Drawer;
