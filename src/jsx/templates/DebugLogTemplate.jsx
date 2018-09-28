import React, { Component } from 'react';
import Timestamp from 'react-timeago';
import OfflineWarning from '../component/OfflineWarning';
import PageTitle from '../component/PageTitle';
import ClipboardButton from '../component/ClipboardButton';
import DeleteLogButton from '../component/DeleteLogButton';

export default function () {
  return class DebuglogTemplate extends Component {
    constructor(props) {
      super(props);

      const background = chrome.extension.getBackgroundPage();
      this.app = background.app;

      // properties
      this.logger = this.app.logger;
      this.state = { entries: this.logger.getEntries() };

      // bindings
      this.reloadPage = this.reloadPage.bind(this);
      this.renderEntries = this.renderEntries.bind(this);
      this.handleNewMessage = this.handleNewMessage.bind(this);
    }

    componentDidMount() {
      this.logger.addEventListener('NewMessage', this.handleNewMessage);
    }

    componentWillUnmount() {
      this.logger.removeEventListener('NewMessage', this.handleNewMessage);
      this.handleNewMessage = null;
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

      if (platforminfo.ready === false) {
        return (
          <div id="debuglog-template" className="row">
            <OfflineWarning />

            <PageTitle text={t('DebugLog')} />

            <p className="text-left emptytext still-loading">
              { t('TheExtensionIsStillLoading') }
            </p>

            <div className="col-xs-3" />

            <button type="button" className="btn btn-success col-xs-6" onClick={this.reloadPage}>
              { t('ReloadPage') }
            </button>

            <div className="col-xs-3" />
          </div>
        );
      }

      if (entries.length === 0) {
        return (
          <div id="debuglog-template" className="row">
            <OfflineWarning />

            <PageTitle text={t('DebugLog')} />

            <p className="text-center emptytext">
              { t('DebugLogIsEmpty') }
            </p>
          </div>
        );
      }

      return (
        <div id="debuglog-template" className="row">
          <OfflineWarning />

          <PageTitle text={t('DebugLog')} />

          <div className="debug-buttons col-xs-12">
            <ClipboardButton />

            <DeleteLogButton parentComponent={this} />
          </div>

          <ul>
            { this.renderEntries() }
          </ul>
        </div>
      );
    }
  };
}
