import tinyhttp from 'tinyhttp';
import React, { Component } from 'react';
import initPageTitle from '../component/pagetitle';
import OfflineWarning from '../component/OfflineWarning';

export default function (renderer, app, window, document) {
  const PageTitle = initPageTitle(renderer, app, window, document);

  return class ChangelogTemplate extends Component {
    componentDidMount() {
      const container = document.querySelector('#changelog');
      const url = chrome.extension.getURL('html/CHANGELOG.html');
      const success = (xhr) => {
        container.innerHTML = xhr.response;
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

      tinyhttp().get(url)
        .then(success)
        .catch(error);
    }

    render() {
      return (
        <div id="changelog-template" className="row">
          <OfflineWarning />
          <PageTitle text="CHANGELOG" previousTemplate="settings" />
          <div id="changelog" />
        </div>
      );
    }
  };
}
