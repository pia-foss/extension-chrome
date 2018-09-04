export default function(renderer, app, window, document) {
  const React = renderer.react

  return class extends React.Component {
    render() {
      return (
        <div className="dropdown">
          <select id="languages" onChange={this.changeLanguage.bind(this)}>
            {this.languages()}
          </select>
        </div>
      )
    }

    changeLanguage(event) {
      const {target} = event,
            {i18n,storage} = app.util,
            targetLocale = target.value
      i18n.changeLocale(targetLocale).then((locale) => {
        storage.setItem("locale", locale)
        renderer.renderTemplate("settings")
        /* reopen 'Extension' section to give impression template wasn't re-rendered */
        document.querySelector(".developer").classList.add("open")
        debug(`i18n: language changed to ${i18n.languageMap.get(locale)}`)
      }).catch(() => {
        /*
           i18n.changeLocale() failed.
           Probably because src/_locales/<targetLocale>/messages.json doesn't exist.
           Show error to user ...?
         */
        debug(`i18n: failed to change language to ${i18n.languageMap.get(locale)}`)
      })
    }

    languages() {
      const {i18n} = app.util,
            {languageMap} = i18n,
            languages = []
      languageMap.forEach((string, locale) => {
        languages.push(
          (<option key={`${string}-${locale}`} selected={i18n.locale === locale} value={locale} id={`language-option-${locale}`}>{string}</option>)
        )
      })
      return languages
    }
  }
}
