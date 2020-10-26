import PropTypes from 'prop-types';
import React, { Component } from 'react';

import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';

class UpgradePage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.settings = this.app.util.settings;
  }

  render() {
    const { context: { theme } } = this.props;

    return (
      <div className={`chrome-upgrade-page row ${theme}`}>
        <CompanyLogo hideLinks={true} />

        <div className="warningicon" />

        <p className="warningtext">
          { t('UpgradeBrowserMessage') }
        </p>

        <p className="btn-center">
          <button type="button" className="btn" onClick={window.close}>
            { t('CloseText') }
          </button>
        </p>
      </div>
    );
  }
}

UpgradePage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(UpgradePage);
