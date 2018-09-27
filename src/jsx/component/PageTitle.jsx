import PropTypes from 'prop-types';
import React, { Component } from 'react';

class PageTitle extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // bindings
    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.renderPreviousTemplate = this.renderPreviousTemplate.bind(this);
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
      this.renderPreviousTemplate();
    }
  }

  renderPreviousTemplate() {
    const { previousTemplate } = this.props;
    this.renderer.renderTemplate(previousTemplate || this.renderer.previousTemplate);
  }

  render() {
    const { text } = this.props;

    return (
      <div className="header">
        <div className="back-row">
          <div className="col-xs-2">
            <div
              role="button"
              tabIndex="-1"
              className="back-icon"
              onClick={this.renderPreviousTemplate}
              onKeyPress={this.renderPreviousTemplate}
            />
          </div>

          <div className="col-xs-8 upcase text">
            { text }
          </div>
        </div>
      </div>
    );
  }
}

PageTitle.propTypes = {
  text: PropTypes.string.isRequired,
  previousTemplate: PropTypes.string,
};

PageTitle.defaultProps = {
  previousTemplate: '',
};

export default PageTitle;
