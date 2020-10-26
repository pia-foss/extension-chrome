import PropTypes from 'prop-types';
import React, { Component } from 'react';

import http from '@helpers/http';
import PageTitle from '@component/PageTitle';
import withAppContext from '@hoc/withAppContext';

class ChangelogPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.settings = this.app.util.settings;
  }

  componentDidMount() {
    const container = document.querySelector('#changelog');
    const url = chrome.extension.getURL('html/CHANGELOG.html');
    const success = async (res) => {
      container.innerHTML = await res.text();
      const links = document.querySelectorAll('#changelog a');
      for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', (event) => {
          chrome.tabs.create({ url: event.target.getAttribute('href') });
        });
      }
    };
    const error = () => {
      container.innerHTML = 'The changelog couldn\'t be loaded due to an error.';
    };

    http.get(url)
      .then(success)
      .catch(error);
  }

  render() {
    const { context: { theme } } = this.props;

    return (
      <div id="changelog-page" className={`row ${theme}`}>
        <PageTitle text={t('ChangelogTitle')} />

        <div id="changelog" />
      </div>
    );
  }
}

ChangelogPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(ChangelogPage);
