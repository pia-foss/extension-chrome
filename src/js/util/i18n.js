import http from '@helpers/http';
import { type } from 'os';

/**
 * I18n is a wrapper around the browser translation service
 *
 * We first attempt to come up with the translations ourselves, and
 * if such a translation cannot be found we fallback to the
 * chrome.i18n API
 */
class I18n {
  constructor(app) {
    // bindings
    this.init = this.init.bind(this);
    this.t = this.t.bind(this);
    this.detectLocale = this.detectLocale.bind(this);
    this.detectBrowserLocale = this.detectBrowserLocale.bind(this);
    this.changeLocale = this.changeLocale.bind(this);
    this.getWorker = this.getWorker.bind(this);
    this.domain = this.domain.bind(this);

    // init
    window.t = this.t;
    this.app = app;
    this.rerouteMap = new Map([['pt', 'pt_BR']]);
    this.domainMap = I18n.createDomainMap();
    this.languageMap = I18n.createLanguageMap();
    this.worker = null;
    this.defaultLocale = 'en';
    this.acceptedLocales = Array.from(this.languageMap.keys());
    this.locale = this.detectLocale() || this.defaultLocale;
    this.translations = new Map([]);
    this.initializing = this.init();
  }
  

  async init() {
    try {
      await this.changeLocale(this.locale);
    }
    catch (_) {
      debug(`i18n: error setting locale "${this.locale}"`);
      if (this.locale !== this.defaultLocale) {
        try {
          await this.changeLocale(this.defaultLocale);
          debug(`i18n: fell back to default locale: ${this.defaultLocale}`);
        }
        catch (__) {
          debug(`i18n: fall back to default locale(${this.defaultLocale}) failed`);
        }
      }
    }
  }

  /**
   * Find the translation for a given key
   */
  t(key, variables = {}) {
    let message = this.translations.get(key) || chrome.i18n.getMessage(key);
    Object.keys(variables).forEach((varKey) => {
      message = message.replace(new RegExp(`%{${varKey}}`, 'g'), variables[varKey]);
    });

    if (message.includes('%{browser}')) {
      message = message.replace(new RegExp('%{browser}', 'g'), this.app.buildinfo.browser);
    }

    if (message.includes('%{appVersion}')) {
      message = message.replace(new RegExp('%{appVersion}', 'g'), `v${this.app.buildinfo.version}`);
    }

    if (message.includes('%{region}')) {
      const region = this.app.util.regionlist.getSelectedRegion();
      message = message.replace(new RegExp('%{region}', 'g'), region.localizedName());
    }

    return message;
  }

  detectLocale() {
    const { storage } = this.app.util;
    const storageLocale = storage.getItem('locale');
    const locale = storageLocale || this.detectBrowserLocale();
    if (this.acceptedLocales.includes(locale)) {
      return locale;
    }
    return undefined;
  }

  detectBrowserLocale() {
    let locale = chrome.i18n.getUILanguage().replace(/-/g, '_');
    if (this.languageMap.has(locale)) {
      return locale;
    }
    locale = locale.slice(0, 2);

    return this.rerouteMap.get(locale) || locale;
  }

  changeLocale(locale) {
    const { icon } = this.app.util;
    if (!this.acceptedLocales.includes(locale)) {
      return Promise.reject();
    }
    
    let targetURL = chrome.extension.getURL(`/_locales/${locale}/messages.json`);

    this.worker = http.get(targetURL)
      .then(async (res) => {
        const json = await res.json();
        this.translations.clear();
        Object.keys(json).forEach((key) => {
          this.translations.set(key, json[key].message);
        });
        this.locale = locale;
        icon.updateTooltip();
        this.worker = null;

        return locale;
      })
      .catch((res) => {
        this.worker = null;

        throw res;
      });
    return this.worker;
  }

  getWorker() {
    return this.worker;
  }

  domain() {
    return this.domainMap.get(this.locale) || this.domainMap.get('en');
  }

  static createLanguageMap() {
    return new Map([
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
  }

  static createDomainMap() {
    return new Map([
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
  }
}

export default I18n;
