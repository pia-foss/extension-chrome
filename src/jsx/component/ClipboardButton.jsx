import React, { Component } from 'react';

class ClipboardButton extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.logger = this.app.logger;
    this.platforminfo = this.app.util.platforminfo;

    // bindings
    this.onClick = this.onClick.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  onClick(event) {
    event.preventDefault();
    document.addEventListener('copy', this.copyToClipboard);
    document.execCommand('copy');
    document.removeEventListener('copy', this.copyToClipboard);
  }

  copyToClipboard(event) {
    event.preventDefault();

    // grab message from debug log
    const messages = this.logger.getEntries()
      .map((entry) => {
        // entry[0] timestamp
        // entry[1] message
        return entry[1];
      })
      .join(this.platforminfo.lineEnding());
    event.clipboardData.setData('Text', messages);

    // update copy button text
    const btn = document.querySelector('.btn');
    btn.innerHTML = t('CopiedToClipboard');
    window.setTimeout(() => {
      btn.innerHTML = t('CopyToClipboard');
    }, 500);
  }

  render() {
    return (
      <div className="col-xs-7 dlcopybtn">
        <button
          type="button"
          className="col-xs-12 btn btn-success"
          onClick={this.onClick}
        >
          { t('CopyToClipboard') }
        </button>
      </div>
    );
  }
}

export default ClipboardButton;
