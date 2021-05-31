import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MoreLinks from '@component/MoreLinks';
import withAppContext from '@hoc/withAppContext';

class CompanyLogo extends Component {
  constructor(props) {
    super(props);

    // properties
    this.state = {
      offline: !navigator.onLine,
    };

    // binding
    this.handleNetworkStatusChange = this.handleNetworkStatusChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleNetworkStatusChange);
    window.addEventListener('offline', this.handleNetworkStatusChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleNetworkStatusChange);
    window.removeEventListener('offline', this.handleNetworkStatusChange);
  }

  handleNetworkStatusChange() {
    this.setState({ offline: !navigator.onLine });
  }

  render() {
    let { error } = this.props;
    const { offline } = this.state;
    const {
      mode,
      hideLinks,
      connection,
      context: { theme },
    } = this.props;
    // Normal Case: turn on and off proxy connection
    let content = '';
    if (mode === 'connecting' && connection === 'connected') { content = t('Disconnecting'); }
    else if (mode === 'connecting' && connection === 'disconnected') {content = t('Connecting'); }
    else if (connection === 'initial') { content = t('GatheringRegions'); }
    else if (connection === 'disconnected' || !connection) {
      const logoUrl = theme === 'dark' ? '/images/pia-logo-white.png' : '/images/pia-logo-black.png';
      content = (
        <img
          width="210"
          className="pia-logo"
          src={logoUrl}
          alt="Private Internet Access Logo"
          title="Private Internet Access"
        />
      );
    }

    // Error Case: any errors we want to display
    if (connection === 'error') { content = error; }
    if (!error) { error = t('UnknownProxyError'); }

    // Offline Case: display no network warning above all else
    let offlineClass = '';
    if (offline) {
      offlineClass = 'offline';
      content = t('NoNetworkConnection');
    }

    return (
      <div className={`company-logo ${mode} ${theme} ${connection} ${offlineClass}`}>
        { /* gradient hack to support background-image */ }
        <div className="connected-gradient">
          { t('Connected') }
        </div>

        <div className="display-content">
          <div className="display-left" />

          <div className="display-middle">
            { content }
          </div>

          <div className="display-right">
            { hideLinks ? '' : <MoreLinks /> }
          </div>
        </div>
      </div>
    );
  }
}

CompanyLogo.propTypes = {
  mode: PropTypes.string,
  error: PropTypes.string,
  hideLinks: PropTypes.bool,
  connection: PropTypes.string,
  context: PropTypes.object.isRequired,
};

CompanyLogo.defaultProps = {
  mode: '',
  error: '',
  connection: '',
  hideLinks: false,
};

export default withAppContext(CompanyLogo);
