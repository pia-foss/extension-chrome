import http from 'helpers/http';

export default function i18n(app) {
  let acceptedLocales;
  const translations = new Map([]);
  const rerouteMap = new Map([['pt', 'pt_BR']]);
  const detectBrowserLocale = () => {
    let locale = chrome.i18n.getUILanguage().replace(/-/g, '_');
    if (this.languageMap.has(locale)) {
      return locale;
    }
    locale = locale.slice(0, 2);

    return rerouteMap.get(locale) || locale;
  };
  const detectLocale = () => {
    const { storage } = app.util;
    const storageLocale = storage.getItem('locale');
    const locale = storageLocale || detectBrowserLocale();
    if (acceptedLocales.includes(locale)) {
      return locale;
    }
    return undefined;
  };

  this.languageMap = new Map([
    ['en', 'English'],
    ['de', 'Deutsch'],
    ['fr', 'Français'],
    ['ru', 'Русский'],
    ['it', 'Italiano'],
    ['nl', 'Nederlands'],
    ['tr', 'Türkçe'],
    ['pl', 'Polski'],
    ['pt_BR', 'Português (Brasil)'],
    ['ja', '日本語'],
    ['es', 'Español (México)'],
    ['da', 'Dansk'],
    ['th', 'ไทย'],
    ['zh_TW', '繁體中文'],
    ['zh_CN', '简体中文'],
    ['ar', 'ةيبرعلا'],
    ['ko', '한국어'],
  ]);
  acceptedLocales = Array.from(this.languageMap.keys());

  this.domainMap = new Map([
    ['en', 'www.privateinternetaccess.com'],
    ['nl', 'nld.privateinternetaccess.com'],
    ['fr', 'fra.privateinternetaccess.com'],
    ['ru', 'rus.privateinternetaccess.com'],
    ['it', 'ita.privateinternetaccess.com'],
    ['ko', 'kor.privateinternetaccess.com'],
    ['no', 'nor.privateinternetaccess.com'],
    ['pl', 'pol.privateinternetaccess.com'],
    ['es', 'mex.privateinternetaccess.com'],
    ['ar', 'ara.privateinternetaccess.com'],
    ['th', 'tha.privateinternetaccess.com'],
    ['tr', 'tur.privateinternetaccess.com'],
    ['ja', 'jpn.privateinternetaccess.com'],
    ['da', 'dnk.privateinternetaccess.com'],
    ['de', 'deu.privateinternetaccess.com'],
    ['pt_BR', 'bra.privateinternetaccess.com'],
    ['zh_CN', 'chi.privateinternetaccess.com'],
    ['zh_TW', 'cht.privateinternetaccess.com'],
  ]);


  let worker = null;
  this.worker = () => {
    return worker;
  };
  this.defaultLocale = 'en';
  this.locale = detectLocale() || this.defaultLocale;
  this.domain = () => {
    return this.domainMap.get(this.locale) || this.domainMap.get('en');
  };

  this.t = (key, variables = {}) => {
    let message = translations.get(key) || chrome.i18n.getMessage(key);
    Object.keys(variables).forEach((varKey) => {
      message = message.replace(new RegExp(`%{${varKey}}`, 'g'), variables[varKey]);
    });

    return message;
  };
  window.t = this.t;

  this.changeLocale = (locale) => {
    const { icon } = app.util;
    if (!acceptedLocales.includes(locale)) {
      return new Promise((_, reject) => {
        reject();
      });
    }
    worker = http.get(`chrome-extension://${chrome.runtime.id}/_locales/${locale}/messages.json`)
      .then(async (res) => {
        const json = await res.json();
        translations.clear();
        Object.keys(json).forEach((key) => {
          translations.set(key, json[key].message);
        });
        this.locale = locale;
        icon.updateTooltip();
        worker = null;

        return locale;
      })
      .catch((res) => {
        worker = null;

        throw res;
      });
    return worker;
  };

  this.changeLocale(this.locale).catch(() => {
    debug(`i18n: error setting locale "${this.locale}"`);
    if (this.locale !== this.defaultLocale) {
      this.changeLocale(this.defaultLocale)
        .then(() => {
          debug(`i18n: fell back to default locale: ${this.defaultLocale}`);
        })
        .catch(() => {
          debug(`i18n: fall back to default locale(${this.defaultLocale}) failed`);
        });
    }
  });

  return this;
}
