import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PageTitle from '@component/PageTitle';
import withAppContext from '@hoc/withAppContext';
import UserRules from '@component/bypasslist/UserRules';
import PopularRules from '@component/bypasslist/PopularRules';
import ImportExportRules from '@component/bypasslist/ImportExportRules';

class BypassListPage extends Component {
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
      <div id="bypasslist-page" className={`row ${theme}`}>
        <PageTitle text={t('ProxyBypassList')} />

        <div className="bypass-wrap">
          <p className="introtext">
            { t('BypassWarningLead') }
            &nbsp;
            <span className="bold-underline">
              { t('BypassWarningBold') }
            </span>
          </p>

          <ImportExportRules />

          <PopularRules popularRules={this.popularRules} />

          <UserRules />
        </div>
      </div>
    );
  }
}

BypassListPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(BypassListPage);
