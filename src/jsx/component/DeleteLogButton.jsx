import PropTypes from 'prop-types';
import React, { Component } from 'react';

class DeleteLogButton extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.logger = this.app.logger;

    // bindings
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    event.preventDefault();
    this.logger.removeEntries();
    const { parentComponent } = this.props;
    parentComponent.setState({ entries: [] });
  }

  render() {
    return (
      <div className="col-xs-5 dldeletebtn">
        <button
          type="button"
          className="col-xs-12 btn btn-danger"
          onClick={this.onClick}
        >
          { t('DeleteDebugLog') }
        </button>
      </div>
    );
  }
}

DeleteLogButton.propTypes = {
  parentComponent: PropTypes.object.isRequired,
};

export default DeleteLogButton;
