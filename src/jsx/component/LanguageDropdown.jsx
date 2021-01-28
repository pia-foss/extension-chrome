import PropTypes from 'prop-types';
import React, { Component } from 'react';

import withAppContext from '@hoc/withAppContext';

class LanguageDropdown extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.i18n = this.app.util.i18n;
    this.storage = this.app.util.storage;

    // bindings
    this.languages = this.languages.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  changeLanguage(event) {
    const { target } = event;
    const { context: { rebuildApp } } = this.props;
    const targetLocale = target.value;

    this.i18n.changeLocale(targetLocale)
      .then((locale) => {
        const { updateLanguage } = this.props;
        this.storage.setItem('locale', locale);
        rebuildApp();
        updateLanguage();
        debug(`i18n: language changed to ${this.i18n.languageMap.get(locale)}`);
      })
      .catch(() => {
        /*
           i18n.changeLocale() failed.
           Probably because src/_locales/<targetLocale>/messages.json doesn't exist.
           Show error to user ...?
         */
        debug('i18n: language change failed');
      });
  }

  languages() {
    const { languageMap } = this.i18n;
    const languages = [];

    Array.from(languageMap.entries()).forEach(([locale, string]) => {
      languages.push(
        (
          <option key={locale} value={locale} id={`language-option-${locale}`}>
            { string }
          </option>
        ),
      );
    });
    return languages;
  }

  render() {
    const theme = this.props.context.getTheme();

    return (
      <div className={`languages-container ${theme} dropdown`}>
        <select
          className={`languages ${theme}`}
          defaultValue={this.i18n.locale}
          onChange={this.changeLanguage}
        >
          { this.languages() }
        </select>
      </div>
    );
  }
}

LanguageDropdown.propTypes = {
  context: PropTypes.object.isRequired,
  updateLanguage: PropTypes.func.isRequired,
};

export default withAppContext(LanguageDropdown);
