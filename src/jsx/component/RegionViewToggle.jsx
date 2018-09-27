import React, { Component } from 'react';
import RegionSorter from 'component/RegionSorter';

class RegionViewToggle extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.storage = this.app.util.storage;

    // bindings
    this.activeToggleID = this.activeToggleID.bind(this);
    this.switchToListView = this.switchToListView.bind(this);
    this.switchToGridView = this.switchToGridView.bind(this);
  }

  componentDidMount() {
    const icon = document.querySelector(this.activeToggleID());
    icon.classList.add('active');
  }

  activeToggleID() {
    switch (this.storage.getItem('regionview')) {
      case 'grid':
        return '#grid-icon';
      default:
        return '#list-icon';
    }
  }

  switchToListView() {
    this.storage.setItem('regionview', 'list');
    this.renderer.renderTemplate('change_region');
  }

  switchToGridView() {
    this.storage.setItem('regionview', 'grid');
    this.renderer.renderTemplate('change_region');
  }

  render() {
    return (
      <div className="row regionfilter">
        <div className="col-xs-9">
          <RegionSorter />
        </div>

        <div className="col-xs-3">
          <div id="toggle-icon">
            <div
              id="list-icon"
              role="button"
              tabIndex="-1"
              onClick={this.switchToListView}
              onKeyPress={this.switchToListView}
            />

            <div
              id="grid-icon"
              role="button"
              tabIndex="-1"
              onClick={this.switchToGridView}
              onKeyPress={this.switchToGridView}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default RegionViewToggle;
