export default function(app) {
  const {storage} = app.util

  this.setDefaults = () => {
    const {contentsettings, chromesettings} = app,
          defaults = {
            "blockplugins":          true, /* TODO: unused until a bug in chrome is fixed. */
            "blockutm":              true,
            "maceprotection":        true,
            "debugmode":             false,
            "rememberme":            true
          }
    for(let k in contentsettings) {
      let s = contentsettings[k]
      defaults[s.settingID] = s.settingDefault
    }
    for(let k in chromesettings) {
      let s = chromesettings[k]
      defaults[s.settingID] = s.settingDefault
    }
    Object.keys(defaults).forEach((key) => {
      if(!this.hasItem(key))
        this.setItem(key, defaults[key])
    })
  }

  this.hasItem = (key) => {
    return storage.hasItem(`settings:${key}`)
  }

  this.getItem = (key) => {
    return storage.getItem(`settings:${key}`) === "true"
  }

  this.setItem = (key, value) => {
    if(value === true || value === "true")
      storage.setItem(`settings:${key}`, "true")
    else
      storage.setItem(`settings:${key}`, "false")
  }

  return this
}
