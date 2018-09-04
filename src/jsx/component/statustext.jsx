import React, {Component} from 'react';
import PropTypes from 'prop-types';

class StatusText extends Component {
  constructor(props) {
    super(props);
    this.state = {enabled: props.enabled};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({enabled: nextProps.enabled});
  }

  render() {
    const connState = this.state.enabled ? 'enabled' : 'disabled'
    return (
      <div>
        <div className="col-xs-3"></div>
        <div className="col-xs-6 text-center">
          <div className="status-title upcase-bold">
            {t("StatusText")}
          </div>
          <div className={`status ${connState}`}>
            {t(connState)}
          </div>
        </div>
        <div className="col-xs-3"></div>
      </div>
    )
  }
}

StatusText.propTypes = {
  enabled: PropTypes.bool
};

export default StatusText;
