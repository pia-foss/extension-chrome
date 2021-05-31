import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';
import RegionListItem from '@component/RegionListItem';
import onFlagError from '@eventhandler/pages/changeregion/onFlagError';

class RegionIso extends Component {
  constructor(props) {
    super(props);

    // bindings
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
    this.localizeIsoName = this.localizeIsoName.bind(this);
    this.getRegionVisibility = this.getRegionVisibility.bind(this);
    this.calculateRegionHeight = this.calculateRegionHeight.bind(this);
    this.toggleRegionVisibility = this.toggleRegionVisibility.bind(this);

    // properties
    this.iso = props.iso;
    this.app = props.context.app;
    this.storage = this.app.util.storage;

    // check storage to see if the regions should be visible
    let show = true;
    const visibleISOs = this.getRegionVisibility();
    if (Object.keys(visibleISOs).includes(this.iso)) { show = visibleISOs[this.iso]; }
    this.state = { showRegions: show };
  }

  onFlagLoadError(event) {
    const { props: { iso } } = this;
    return onFlagError(event, iso);
  }

  getRegionVisibility() {
    const visibleISOs = this.storage.getItem('visibleISOs') || '{}';
    return JSON.parse(visibleISOs);
  }

  toggleRegionVisibility() {
    const { showRegions } = this.state;
    const visibleISOs = this.getRegionVisibility();

    // update storage
    visibleISOs[this.iso] = !showRegions;
    this.storage.setItem('visibleISOs', JSON.stringify(visibleISOs));

    // update state
    this.setState({ showRegions: !showRegions });
  }

  localizeIsoName() {
    // forgive me for this horrible hack
    const currentIso = this.iso.toLowerCase();
    const isos = ['de', 'ca', 'us', 'au', 'gb'];

    // check if this.iso is within the set of grouped isos
    // Fall back to displaying the capitalized country code if no country name is known
    if (!isos.includes(currentIso)) { return currentIso.toUpperCase(); }
    // otherwise localize and return
    if (currentIso === 'ca') { return t('canada'); }
    return t(currentIso);
  }

  calculateRegionHeight() {
    const { regions } = this.props;
    const { showRegions } = this.state;
    // calculate height based on number of regions nested
    if (showRegions) { return 35 * regions.length; }
    return 0;
  }

  render() {
    const { regions, context: { theme } } = this.props;
    const { flag } = regions[0];
    const { showRegions } = this.state;
    const regionHeight = this.calculateRegionHeight();
    const componentRegions = regions.map((region) => {
      return (<RegionListItem key={region.id} nested={true} region={region} />);
    });

    return (
      <div
        role="button"
        tabIndex="-1"
        className={`iso ${theme}`}
        onClick={this.toggleRegionVisibility}
        onKeyPress={this.toggleRegionVisibility}
      >
        <div className="iso-display noselect">
          <div className="arrow-container">
            <div className={`iso-arrow ${showRegions ? 'open' : ''}`} />
          </div>

          <div className="flag-container">
            <img
              className="flag"
              alt={this.iso}
              src={flag}
              onError={this.onFlagLoadError}
            />
          </div>

          <span className="regionnamelist">
            { this.localizeIsoName() }
          </span>
        </div>

        <div className="iso-regions" style={{ height: `${regionHeight}px` }}>
          { componentRegions }
        </div>
      </div>
    );
  }
}

RegionIso.propTypes = {
  iso: PropTypes.string.isRequired,
  regions: PropTypes.array.isRequired,
  context: PropTypes.object.isRequired,
};

export default withAppContext(RegionIso);
