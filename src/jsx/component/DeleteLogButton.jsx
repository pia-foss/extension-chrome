import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';

class DeleteLogButton extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.logger = this.app.logger;

    // bindings
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    event.preventDefault();
    this.logger.removeEntries();
  }

  render() {
    return (
      <button type="button" className="btn btn-danger clear" onClick={this.onClick}>
        { t('DeleteDebugLog') }
      </button>
    );
  }
}

DeleteLogButton.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(DeleteLogButton);
