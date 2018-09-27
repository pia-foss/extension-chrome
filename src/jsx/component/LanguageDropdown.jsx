import React, { Component } from 'react';

class LanguageDropdown extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.i18n = this.app.util.i18n;
    this.storage = this.app.util.storage;

    // bindings
    this.languages = this.languages.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  changeLanguage(event) {
    const { target } = event;
    const targetLocale = target.value;

    this.i18n.changeLocale(targetLocale)
      .then((locale) => {
        this.storage.setItem('locale', locale);
        this.renderer.renderTemplate('settings');
        /* reopen 'Extension' section to give impression template wasn't re-rendered */
        document.querySelector('.developer').classList.add('open');
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
    return (
      <div className="languages-container dropdown">
        <select id="languages" defaultValue={this.i18n.locale} onChange={this.changeLanguage}>
          { this.languages() }
        </select>
      </div>
    );
  }
}

export default LanguageDropdown;
