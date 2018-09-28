import React, { Component } from 'react';

class RegionSorter extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.document = document;
    this.storage = this.app.util.storage;

    // bindings
    this.changeSortBy = this.changeSortBy.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.documentClickListener = this.documentClickListener.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.documentClickListener);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.documentClickListener);
  }

  documentClickListener() {
    // this is used to close the dropdown if clicked anywhere outside the dropdown
    const target = this.document.querySelector('.dropdown');
    if (target.classList.contains('open')) {
      target.classList.remove('open');
    }
  }

  changeSortBy(event) {
    const value = event.target.getAttribute('data-value');
    if (value === 'latency') { this.storage.setItem('sortby', 'latency'); }
    else { this.storage.setItem('sortby', 'name'); }
    this.renderer.renderTemplate('change_region');
  }

  toggleDropdown(event) {
    const target = this.document.querySelector('.dropdown');
    if (target.classList.contains('open')) { target.classList.remove('open'); }
    else { target.classList.add('open'); }
    event.nativeEvent.stopImmediatePropagation();
  }

  render() {
    const sortBy = this.storage.getItem('sortby') || 'name';
    const translations = { name: t('RegionName'), latency: t('RegionLatency') };

    return (
      <div id="region-sorter-dropdown" className="dropdown">
        <button
          id="dropdownMenu1"
          type="button"
          aria-expanded="true"
          aria-haspopup="true"
          data-toggle="dropdown"
          className="btn btn-default dropdown-toggle"
          onClick={this.toggleDropdown}
        >
          { t('SortBy') }
          &nbsp;
          { translations[sortBy] }
          <span className="caret" />
        </button>

        <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
          <li>
            <a
              id="sort-by-name"
              href="#name"
              className={`${sortBy === 'name' ? 'active' : ''}`}
              data-value="name"
              onClick={this.changeSortBy}
              onKeyPress={this.changeSortBy}
            >
              { t('RegionName') }
            </a>
          </li>

          <li>
            <a
              id="sort-by-latency"
              href="#latency"
              className={`${sortBy === 'latency' ? 'active' : ''}`}
              data-value="latency"
              onClick={this.changeSortBy}
              onKeyPress={this.changeSortBy}
            >
              { t('RegionLatency') }
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default RegionSorter;
