import React from 'react';
import PropType from 'prop-types';

const BypassItem = ({ onRemoveItem, rule }) => {
  return (
    <div className="bypass-rule">
      <span className="name">
        { rule }
      </span>

      <span
        role="button"
        tabIndex="-1"
        className="rem"
        onClick={onRemoveItem}
        onKeyPress={onRemoveItem}
      />
    </div>
  );
};

BypassItem.propTypes = {
  rule: PropType.string.isRequired,
  onRemoveItem: PropType.func.isRequired,
};

export default BypassItem;
