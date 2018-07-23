import React, {Component} from 'react';
import StatusText from 'component/statustext';
import PropTypes from 'prop-types';

class Switch extends Component {
  constructor(props) {
    super(props);

    this.debounce = null;
    this._proxy = props.app.proxy;
    this._regionlist = props.app.util.regionlist;
    this.state = { enabled: this._proxy.enabled() };

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

    if(this._proxy.enabled()) { promise = this._proxy.disable(); }
    else { promise = this._proxy.enable(this._regionlist.getSelectedRegion()); }

    return promise.then((proxy) => {
      this.setState({enabled: proxy.enabled()});
    });
  }

  componentDidMount() {
    const checked   = document.createElement('style');
    const unchecked = document.createElement('style');
    checked.innerHTML   = `.switch:checked::after {content:'ON'}`;
    unchecked.innerHTML = `.switch::after {content:'OFF'}`;
    document.body.appendChild(checked);
    document.body.appendChild(unchecked);
  }

  render() {
    return (
      <div>
        <StatusText enabled={this.state.enabled}/>
        <div className="switch-container">
          <input
            type="checkbox"
            className="switch"
            checked={this.state.enabled}
            onChange={this.onChange}/>
        </div>
      </div>
    );
  }
}

Switch.propTypes = {
  app: PropTypes.object
};

export default Switch;
