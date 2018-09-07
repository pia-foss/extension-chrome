import React, { Component } from 'react';
import PropTypes from 'prop-types';

class StatusText extends Component {
  constructor(props) {
    super(props);
    this.state = { enabled: props.enabled };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ enabled: nextProps.enabled });
  }

  render() {
    const { enabled } = this.state;
    const connState = enabled ? 'enabled' : 'disabled';
    return (
      <div>
        <div className="col-xs-3" />
        <div className="col-xs-6 text-center">
          <div className="status-title upcase-bold">
            { t('StatusText') }
          </div>
          <div className={`status ${connState}`}>
            { t(connState) }
          </div>
        </div>
        <div className="col-xs-3" />
      </div>
    );
  }
}

StatusText.propTypes = {
  enabled: PropTypes.bool.isRequired,
};

export default StatusText;
