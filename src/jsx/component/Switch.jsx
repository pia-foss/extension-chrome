import React from 'react';
import PropTypes from 'prop-types';

const Switch = (props) => {

  let { mode, connection } = props;
  const {
    theme,
    region,
    regions,
    classes,
    onToggleConnection,
  } = props;

  // noop if connection is 'error'
  let handler = onToggleConnection;
  const pending = regions.some((current) => { return current.latency === 'PENDING'; });
  if (connection === 'error' || !region) { handler = () => {}; }

  // Show switch in loading mode if pending on region latency
  if (!region) {
    mode = 'connecting';
    connection = 'connected';
  }

  return (
    <div
      role="button"
      tabIndex="-1"
      className={`outer-circle ${theme} ${connection} ${mode} ${classes}`}
      onClick={handler}
      onKeyPress={handler}
    >
      <div className="spinner">
        <div className="spinner-gradient" />

        <div className="spinner-inner">
          <div className="power-icon" />
        </div>
      </div>
    </div>
  );
};

Switch.propTypes = {
  region: PropTypes.object,
  regions: PropTypes.array,
  classes: PropTypes.string,
  mode: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  connection: PropTypes.string.isRequired,
  onToggleConnection: PropTypes.func.isRequired,
};

Switch.defaultProps = {
  classes: '',
  regions: [],
  region: undefined,
};

export default Switch;
