import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PageTitle from '@component/PageTitle';
import withAppContext from '@hoc/withAppContext';
import ManageLocations from '@component/smart-location/ManageLocations';

class SmartLocationPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.buildinfo = this.app.buildinfo;
    this.settings = this.app.util.settings;
    this.regionlist = this.app.util.regionlist;
    this.popularRules = this.app.util.bypasslist.popularRulesByName();
  }

  render() {
    const { context: { theme } } = this.props;

    return (
      <div id="smart-location-page" className={`row ${theme}`}>
        <PageTitle text={t('SmartLocation')} />

        <div className="bypass-wrap">
          {/* <p className="introtext">
            { t('BypassWarningLead') }
            &nbsp;
            <span className="bold-underline">
              { t('BypassWarningBold') }
            </span>
          </p> */}

          <ManageLocations />
        </div>
      </div>
    );
  }
}

SmartLocationPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(SmartLocationPage);
