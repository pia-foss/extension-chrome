import tinyhttp from "tinyhttp"

export default function(app) {
  let acceptedLocales,
      translations = new Map([]),
      rerouteMap = new Map([["pt","pt_BR"]]),
      detectBrowserLocale = () => {
        let locale = chrome.i18n.getUILanguage().replace("-", "_")
        if(this.languageMap.has(locale))
          return locale
        locale = locale.slice(0,2)
        return rerouteMap.get(locale) || locale
      },
      detectLocale = () => {
        const {storage} = app.util,
              storageLocale = storage.getItem("locale")
        const locale = storageLocale ? storageLocale : detectBrowserLocale()
        if(acceptedLocales.includes(locale))
          return locale
      }

  this.languageMap = new Map([
    ['en', 'English'],
    ['de', 'Deutsch'],
    ['fr', 'Français'],
    ['ru',  'Русский'],
    ['it', 'Italiano'],
    ['nl','Nederlands'],
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
    ['ko', '한국어']
  ])
  acceptedLocales = Array.from(this.languageMap.keys())

  this.domainMap = new Map([
    ["en", "www.privateinternetaccess.com"],
    ["nl", "nld.privateinternetaccess.com"],
    ["fr", "fra.privateinternetaccess.com"],
    ["ru", "rus.privateinternetaccess.com"],
    ["it", "ita.privateinternetaccess.com"],
    ["ko", "kor.privateinternetaccess.com"],
    ["no", "nor.privateinternetaccess.com"],
    ["pl", "pol.privateinternetaccess.com"],
    ["es", "mex.privateinternetaccess.com"],
    ["ar", "ara.privateinternetaccess.com"],
    ["th", "tha.privateinternetaccess.com"],
    ["tr", "tur.privateinternetaccess.com"],
    ["ja", "jpn.privateinternetaccess.com"],
    ["da", "dnk.privateinternetaccess.com"],
    ["de", "deu.privateinternetaccess.com"],
    ["pt_BR", "bra.privateinternetaccess.com"],
    ["zh_CN", "chi.privateinternetaccess.com"],
    ["zh_TW", "cht.privateinternetaccess.com"]
  ])


  let worker = null
  this.worker = () => worker
  this.defaultLocale = "en"
  this.locale = detectLocale() || this.defaultLocale
  this.domain = () => this.domainMap.get(this.locale) || this.domainMap.get("en")

  this.t = (key, variables={}) => {
    let message = translations.get(key) || chrome.i18n.getMessage(key)
    for(let variable in variables)
      message = message.replace(new RegExp(`%{${variable}}`, 'g'), variables[variable])
    return message
  }
  window.t = this.t

  this.changeLocale = (locale) => {
    const {icon} = app.util,
          http = tinyhttp(`chrome-extension://${chrome.runtime.id}`)
    if(!acceptedLocales.includes(locale))
      return new Promise((_, reject) => reject())
    worker = http.get(`/_locales/${locale}/messages.json`).then((xhr) => {
      const j = JSON.parse(xhr.responseText)
      translations.clear()
      for(let key in j)
        translations.set(key, j[key].message)
      this.locale = locale
      icon.updateTooltip()
      worker = null
      return locale
    }).catch((xhr) => {
      worker = null
      throw(xhr)
    })
    return worker
  }

  this.changeLocale(this.locale).catch(() => {
    debug(`i18n: error setting locale "${this.locale}"`)
    if(this.locale !== this.defaultLocale)
      this.changeLocale(this.defaultLocale).then(() => {
        debug(`i18n: fell back to default locale: ${this.defaultLocale}`)
      }).catch((e) => {
        debug(`i18n: fall back to default locale(${this.defaultLocale}) failed`)
      })
  })

  return this
}
