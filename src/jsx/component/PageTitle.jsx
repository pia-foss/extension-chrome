import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withAppContext from '@hoc/withAppContext';

import listenOnline from '@hoc/listenOnline';

class PageTitle extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;

    // bindings
    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.renderPreviousPage = this.renderPreviousPage.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPressed);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPressed);
  }

  onKeyPressed(event) {
    const currentType = document.activeElement.type;
    const ignoredFields = ['textarea', 'text'];

    if (ignoredFields.indexOf(currentType) < 0 && event.keyCode === 37) {
      this.renderPreviousPage();
    }
  }

  renderPreviousPage() {
    this.history.goBack();
  }

  render() {
    const { text, online, context: { theme } } = this.props;
    let content = text;

    // Offline Case: display no network warning above all else
    let offlineClass = '';
    if (!online) {
      offlineClass = 'offline';
      content = t('NoNetworkConnection');
    }

    return (
      <div className={`header ${theme} ${offlineClass}`}>
        <div
          role="button"
          tabIndex="-1"
          className="back-icon"
          onClick={this.renderPreviousPage}
          onKeyPress={this.renderPreviousPage}
        />

        <div className="text">
          { content }
        </div>
      </div>
    );
  }
}

PageTitle.propTypes = {
  text: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default listenOnline(withRouter(withAppContext(PageTitle)));
