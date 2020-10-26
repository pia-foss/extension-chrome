import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';

class ClipboardButton extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
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
    }, 5000);
  }

  render() {
    return (
      <button type="button" className="btn copy noselect" onClick={this.onClick}>
        { t('CopyToClipboard') }
      </button>
    );
  }
}

ClipboardButton.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(ClipboardButton);
