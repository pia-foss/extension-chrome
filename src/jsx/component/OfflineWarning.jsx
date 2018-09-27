import React, { Component } from 'react';

class OfflineWarning extends Component {
  constructor(props) {
    super(props);

    // properties and state
    this.state = { offline: !navigator.onLine };

    // bindings
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
    const { offline } = this.state;
    return (
      offline ? (
        <div className="offline-warning">
          { t('NoNetworkConnection') }
        </div>
      ) : ''
    );
  }
}

export default OfflineWarning;
