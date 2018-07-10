import React from 'react';
import PropType from 'prop-types';

const BypassItem = ({onRemoveItem, rule}) => {
  return (
    <div className="otherbypassitem">
      <span className="name">{rule}</span>
      <span className="rem" onClick={onRemoveItem} />
    </div>
  );
};

BypassItem.propTypes = {
  onRemoveItem: PropType.func,
  rule: PropType.string.isRequired,
};

export default BypassItem;
