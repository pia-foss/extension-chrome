import React, { Component } from 'react';
import StatusText from 'component/StatusText';

class Switch extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.debounce = null;
    this.proxy = this.app.proxy;
    this.regionlist = this.app.util.regionlist;
    this.state = {
      enabled: this.proxy.enabled(),
      region: this.regionlist.getSelectedRegion(),
    };

    // bindings
    this.onChange = this.onChange.bind(this);
    this.handleProxy = this.handleProxy.bind(this);
  }

  onChange() {
    // debounce the calls to the proxy handler by 175ms
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => { this.handleProxy(); }, 175);
  }

  handleProxy() {
    let promise;

    if (this.proxy.enabled()) { promise = this.proxy.disable(); }
    else { promise = this.proxy.enable(this.regionlist.getSelectedRegion()); }

    return promise.then((proxy) => {
      this.setState({ enabled: proxy.enabled() });
    });
  }

  render() {
    const { enabled, region } = this.state;
    return (
      <div>
        <StatusText enabled={enabled} hasRegion={!!region} />

        <div className="switch-container">
          <input
            type="checkbox"
            className="switch"
            checked={enabled}
            disabled={!region}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}

export default Switch;
