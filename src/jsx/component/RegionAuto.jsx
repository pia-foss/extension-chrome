import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withAppContext from '@hoc/withAppContext';
import LoadingEllipsis from '@component/LoadingEllipsis';
import onFlagError from '@eventhandler/pages/changeregion/onFlagError';

class RegionAuto extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.storage = this.app.util.storage;
    this.regionlist = this.app.util.regionlist;
    this.state = { isAuto: this.regionlist.getIsAuto() };

    // bindings
    this.onClick = this.onClick.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  async onClick(e) {
    e.stopPropagation();
    this.regionlist.setSelectedRegion('auto');
    await this.app.proxy.enable();
    return this.history.push('/');
  }

  onFlagLoadError(event) {
    const { region } = this.props;
    return onFlagError(event, region);
  }

  render() {
    const { isAuto } = this.state;
    const { region, context: { theme } } = this.props;

    if (!region) { return <LoadingEllipsis theme={theme} />; }

    return (
      <div
        role="button"
        tabIndex="-1"
        className={`region-list-item ${theme}`}
        onClick={this.onClick}
        onKeyPress={this.onClick}
      >
        <div className="arrow-container" />

        <div className="flag-container">
          { region.override
            ? <div className="empty-flag" />
            : (
              <img
                className="flag"
                alt={region.iso}
                src={region.flag}
                onError={this.onFlagLoadError}
              />
            )
          }
        </div>

        <span className="regionnamelist">
          <div className={`region-name-title ${isAuto ? 'active' : ''}`}>
            { t('ChooseAutomatically') }
          </div>

          <div className="region-name-label">
            { region.localizedName() }
          </div>
        </span>

        <div className="list-item-latency" />

        <div className="heart-container" />
      </div>
    );
  }
}

RegionAuto.propTypes = {
  region: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withAppContext(RegionAuto));
