import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';

class Tile extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.state = { close: false };

    // bindings
    this.buildFlag = this.buildFlag.bind(this);
    this.toggleTile = this.toggleTile.bind(this);
    this.buildClassName = this.buildClassName.bind(this);
  }

  toggleTile() {
    const { name, saved, toggleTileSaved } = this.props;
    return toggleTileSaved(name, !saved);
  }

  buildFlag() {
    const { saved, hideFlag, context: { theme } } = this.props;
    if (hideFlag) { return undefined; }

    // if saved, use green flag always
    let flagUrl = '';
    if (saved) { flagUrl = '/images/tiles/bookmark/bookmark-green.svg'; }
    else if (theme === 'dark') { flagUrl = '/images/tiles/bookmark/bookmark-dark.svg'; }
    else { flagUrl = '/images/tiles/bookmark/bookmark-light.svg'; }

    return (
      <div
        role="button"
        tabIndex="-1"
        className="save-flag"
        onClick={this.toggleTile}
        onKeyPress={this.toggleTile}
      >
        <img alt="Pinned" src={flagUrl} />
      </div>
    );
  }

  /**
   * Builds classname for tile container
   *
   * @returns {string}
   */
  buildClassName() {
    const { close } = this.state;
    const { name, saved, context: { theme } } = this.props;
    const classList = [];
    classList.push('tile');
    classList.push(`${name.toLowerCase()}-tile`);
    classList.push(theme);
    if (saved) { classList.push('saved', 'drawer-tile'); }
    if (close) { classList.push('close'); }

    return classList.join(' ');
  }

  render() {
    const { children, name } = this.props;
    const className = this.buildClassName();

    return (
      <div className={className}>
        <div className={`${name.toLowerCase()} child noselect`}>
          { this.buildFlag() }
          { children }
        </div>
      </div>
    );
  }
}

Tile.propTypes = {
  saved: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

export default withAppContext(Tile);
