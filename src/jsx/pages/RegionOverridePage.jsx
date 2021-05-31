import PropTypes from 'prop-types';
import React, { Component } from 'react';

import withAppContext from '@hoc/withAppContext';
import LabelledInput from '@component/LabelledInput';

class RegionOverridePage extends Component {
  constructor(props) {
    super(props);

    // bindings
    this.app = props.context.app;
    this.onAddClick = this.onAddClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.setError = this.setError.bind(this);
    this.clearError = this.clearError.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.refreshRegions = this.refreshRegions.bind(this);
    this.onSelect = this.onSelect.bind(this);

    this.proxy = this.app.proxy;
    const { regionlist } = this.app.util;
    this.state = {
      name: '',
      host: '',
      port: RegionOverridePage.defaultPort,
      overrideRegions: regionlist.getOverrideArray(),
      errorMessage: '',
    };
  }

  async onAddClick() {
    const { name, host, port } = this.state;
    const { util: { regionlist } } = this.app;

    try {
      regionlist.addOverrideRegion({ name, host, port });
      this.setState(() => {
        return {
          name: '',
          host: '',
          port: RegionOverridePage.defaultPort,
        };
      });
    }
    catch (err) {
      const msg = err.message || err;
      this.setError(msg);
    }

    this.refreshRegions();

    // to update latency & ping gateways
    await regionlist.sync();
  }

  onChange(ev) {
    const { name, value } = ev.target;
    this.setState(() => {
      return { [name]: name === 'port' ? Number(value) : value };
    });
  }

  async onRemove(ev) {
    const { name } = ev.target;
    const { util: { regionlist } } = this.app;
    const wasSelected = regionlist.removeOverrideRegion(name);
    this.refreshRegions();
    // if proxy was connected to this region, refresh proxy
    if (wasSelected && this.proxy.enabled()) {
      await this.proxy.enable();
    }
  }

  async onSelect(ev) {
    const { name: id } = ev.target;
    const { util: { regionlist } } = this.app;
    regionlist.setSelectedRegion(id);
    if (this.proxy.enabled()) {
      await this.proxy.enable();
    }
  }

  setError(errorMessage) {
    this.setState(() => {
      return { errorMessage };
    });
  }

  refreshRegions() {
    const { util: { regionlist } } = this.app;
    this.setState(() => {
      return {
        overrideRegions: regionlist.getOverrideArray(),
      };
    });
  }

  clearError() {
    this.setError('');
  }

  render() {
    const {
      state: {
        overrideRegions,
        errorMessage,
        host,
        name,
        port,
      },
    } = this;
    return (
      <div id="region-override-template">
        <div className="override-heading">
          <h1 className="override-title">Region Override</h1>
          <span className="disclaimer">
            This page is intended for development and debugging purposes
          </span>
        </div>
        <div className="add-region">
          <LabelledInput
            name="name"
            text="Name:"
            placeholder="override #1"
            className="override-input"
            type="text"
            onChange={this.onChange}
            value={name}
          />
          <LabelledInput
            name="host"
            text="Host:"
            placeholder="override.privateinternetaccess.com"
            className="override-input"
            type="text"
            onChange={this.onChange}
            value={host}
          />
          <LabelledInput
            name="port"
            text="Port:"
            className="override-input"
            type="number"
            onChange={this.onChange}
            value={port}
          />
          <button
            type="button"
            className="add"
            onClick={this.onAddClick}
          >
            Add
          </button>
        </div>
        <div className="error">
          <span className="error-message">
            { errorMessage }
          </span>
        </div>
        { !!overrideRegions.length && (
          <table className="override-regions">
            <tbody>
              <tr>
                <th className="name-header">Name</th>
                <th className="host-header">Host</th>
                <th className="port-header">Port</th>
                <th className="select-header">Select</th>
                <th className="remove-header">Remove</th>
              </tr>
              {
                overrideRegions.map((region) => {
                  return (
                    <tr key={region.id} className="override-region">
                      <td className="name">{ region.name }</td>
                      <td className="host">{ region.host }</td>
                      <td className="port">{ region.port }</td>
                      <td className="select">
                        <button
                          type="button"
                          name={region.id}
                          onClick={this.onSelect}
                        >
                          &#x2713;
                        </button>
                      </td>
                      <td className="remove">
                        <button
                          type="button"
                          name={region.name}
                          onClick={this.onRemove}
                        >
                          &#x274c;
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        ) }
      </div>
    );
  }
}

RegionOverridePage.defaultPort = 443;
RegionOverridePage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(RegionOverridePage);
