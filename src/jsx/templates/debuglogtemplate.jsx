import React, { Component } from 'react';
import Timestamp from 'react-timeago';
import OfflineWarning from '../component/OfflineWarning';
import initPageTitle from '../component/pagetitle';
import initClipboardButton from '../component/clipboardbutton';
import initDeleteLogButton from '../component/deletelogbutton';

export default function (renderer, app, window, document) {
  const PageTitle = initPageTitle(renderer, app, window, document);
  const ClipboardButton = initClipboardButton(renderer, app, window, document);
  const DeleteLogButton = initDeleteLogButton(renderer, app, window, document);

  return class DebuglogTemplate extends Component {
    constructor(props) {
      super(props);

      // properties
      this.logger = app.logger;
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
      const { entries } = this.state;
      return entries.map((entry) => {
        const [timestamp, message] = entry;
        return (
          <li>
            <span className="bold">
              { message }
            </span>
            <br />
            <Timestamp live={false} date={timestamp} />
          </li>
        );
      });
    }

    render() {
      const { entries } = this.state;
      const { platforminfo } = app.util;

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
          <div className="col-xs-12">
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
