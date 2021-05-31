import PropTypes from 'prop-types';
import Timestamp from 'react-timeago';
import React, { Component } from 'react';

import PageTitle from '@component/PageTitle';
import withAppContext from '@hoc/withAppContext';
import ClipboardButton from '@component/ClipboardButton';
import DeleteLogButton from '@component/DeleteLogButton';

class DebuglogPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.logger = this.app.logger;
    this.settings = this.app.util.settings;
    this.state = { entries: this.logger.getEntries() };

    // bindings
    this.reloadPage = this.reloadPage.bind(this);
    this.renderEntries = this.renderEntries.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
  }

  handleNewMessage() {
    this.setState({ entries: this.logger.getEntries() });
  }

  reloadPage() {
    this.forceUpdate();
  }

  renderEntries() {
    let counter = 0;
    const { entries } = this.state;
    return entries.map(([timestamp, message]) => {
      counter += 1;
      return (
        <li key={counter}>
          <div className="bold">
            { message }
          </div>

          <Timestamp live={false} date={timestamp} />
        </li>
      );
    });
  }

  render() {
    const { entries } = this.state;
    const { platforminfo } = this.app.util;
    const { context: { theme } } = this.props;

    if (platforminfo.ready === false) {
      return (
        <div id="debuglog-page" className={`row ${theme}`}>
          <PageTitle text={t('DebugLog')} />

          <p className="still-loading">
            { t('TheExtensionIsStillLoading') }
          </p>

          <div className="reload-container">
            <button type="button" className="btn" onClick={this.reloadPage}>
              { t('ReloadPage') }
            </button>
          </div>
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div id="debuglog-page" className={`row ${theme}`}>
          <PageTitle text={t('DebugLog')} />

          <p className="no-entries">
            { t('DebugLogIsEmpty') }
          </p>
        </div>
      );
    }

    return (
      <div id="debuglog-page" className={`row ${theme}`}>
        <PageTitle text={t('DebugLog')} />

        <div className="debug-buttons">
          <ClipboardButton />

          <DeleteLogButton parentComponent={this} />
        </div>

        <ul>
          { this.renderEntries() }
        </ul>
      </div>
    );
  }
}

DebuglogPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(DebuglogPage);
