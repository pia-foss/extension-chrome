export default function(app) {
  const self          = this,
        localStorage  = window.localStorage,
        memoryStorage = {},
        stores        = {
          "localStorage":  localStorage,
          "memoryStorage": memoryStorage
        }

  self.hasItem = (key, backend = "localStorage") => {
    const item = self.getItem(key, backend)
    return item !== undefined && item !== null
  }

  self.getItem = (key, backend = "localStorage") => {
    switch(backend) {
    case "localStorage":
      return stores[backend].getItem(key)
    case "memoryStorage":
      return stores[backend][key]
    default:
      throw `Unknown store: ${backend}`
    }
  }

  self.setItem = (key, value, backend = "localStorage") => {
    if(value === undefined || value === null)
      value = ""
    switch(backend) {
    case "localStorage":
      return stores[backend].setItem(key, value)
    case "memoryStorage":
      stores[backend][key] = value
      return value
    default:
      throw `Unknown store: ${backend}`
    }
  }

  self.removeItem = (key, backend = "localStorage") => {
    switch(backend) {
    case "localStorage":
      return stores[backend].removeItem(key)
    case "memoryStorage":
      return delete(stores[backend][key])
    default:
      throw `Unknown store: ${backend}`
    }
  }

  return self
}
