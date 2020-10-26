import React from 'react';
import PropTypes from 'prop-types';

const SmartLocationItem = ({ rule,theme, onRemoveItem,onEditItem }) => {

  const [hovering,useHover] = React.useState(true);
  return (
    <div className={`smart-location-item ${theme}`} 
    onMouseEnter={()=>{useHover(false)}}
    onMouseLeave={()=>useHover(true)}
    >
      <span className="name">
        { rule.userRules }
      </span>
    <div  
    >
      { hovering ? <img className="image-flag" src={rule.proxy.flag} alt={rule.proxy.iso}/> : <div> <span
        role="button"
        tabIndex="-1"
        className="edit"
        onClick={onEditItem}
        onKeyPress={onEditItem}
      />

      <span
        role="button"
        tabIndex="-1"
        className="rem"
        onClick={onRemoveItem}
        onKeyPress={onRemoveItem}
      /></div>}
    </div>
    </div>
  );
};

SmartLocationItem.propTypes = {
  rule: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
};

export default SmartLocationItem;
