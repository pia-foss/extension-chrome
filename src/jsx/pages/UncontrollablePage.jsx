import PropTypes from 'prop-types';
import React, { Component } from 'react';

import CompanyLogo from '@component/CompanyLogo';
import withAppContext from '@hoc/withAppContext';

class UncontrollablePage extends Component {
  constructor(props) {
    super(props);

    // Properties
    this.app = props.context.app;
    this.settings = this.app.util.settings;
    this.extensionsUrl = 'chrome://extensions';

    // Bindings
    this.openExtensionsPage = this.openExtensionsPage.bind(this);
  }

  openExtensionsPage() {
    chrome.tabs.create({ url: this.extensionsUrl });
  }

  render() {
    const { context: { theme } } = this.props;

    return (
      <div className={`uncontrollable-page row ${theme}`}>
        <CompanyLogo hideLinks={true} />

        <div className="warningicon" />

        <p className="warningtext">
          { t('CannotUsePIAMessage') }
        </p>

        <p className="btn-center">
          <button
            type="button"
            className="btn"
            onClick={this.openExtensionsPage}
          >
            { t('ManageExtensions') }
          </button>
        </p>
      </div>
    );
  }
}

UncontrollablePage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(UncontrollablePage);
