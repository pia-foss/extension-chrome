import PropTypes from 'prop-types';
import React, { Component } from 'react';

class StatusText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: props.enabled,
      hasRegion: props.hasRegion,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      enabled: nextProps.enabled,
      hasRegion: nextProps.hasRegion,
    });
  }

  render() {
    const { enabled, hasRegion } = this.state;

    // determine component display state
    let state = 'unavailable';
    if (hasRegion && enabled) { state = 'enabled'; }
    else if (hasRegion) { state = 'disabled'; }

    return (
      <div className="status-text">
        <div className="col-xs-3" />

        <div className="col-xs-6">
          <div className="status-title">
            { t('StatusText') }
          </div>

          <div className={`status ${state}`}>
            { t(state) }
          </div>
        </div>

        <div className="col-xs-3" />
      </div>
    );
  }
}

StatusText.propTypes = {
  enabled: PropTypes.bool.isRequired,
  hasRegion: PropTypes.bool.isRequired,
};

export default StatusText;
