import React, { Component } from 'react';

/**
 * Add online prop to a component
 */
function listenOnline(NestedComponent) {
  class OnlineListener extends Component {
    constructor(props) {
      super(props);

      // bindings
      this.handleNetworkStatusChange = this.handleNetworkStatusChange.bind(this);

      // state
      this.state = { online: OnlineListener.getOnlineStatus() };
    }

    componentDidMount() {
      window.addEventListener('online', this.handleNetworkStatusChange);
      window.addEventListener('offline', this.handleNetworkStatusChange);
    }

    componentWillUnmount() {
      window.removeEventListener('online', this.handleNetworkStatusChange);
      window.removeEventListener('offline', this.handleNetworkStatusChange);
    }

    static getOnlineStatus() {
      return navigator.onLine;
    }

    handleNetworkStatusChange() {
      this.setState({ online: OnlineListener.getOnlineStatus() });
    }

    render() {
      const { state: { online } } = this;
      return <NestedComponent online={online} {...this.props} />;
    }
  }

  return OnlineListener;
}

export default listenOnline;
