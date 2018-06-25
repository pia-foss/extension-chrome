export default function(app) {
  let entries  = [];
  const listeners = new Map([["NewMessage", []]]),
        maxsize   = 200,
        stringify = (message) => {
          if(typeof(message) === "string")
            return message
          else
            return JSON.stringify(message)
        }

  this.debug = async (message, condition) => {
    if(app.util.settings.getItem("debugmode")) {
      if(!condition || condition()) {
        if(entries.length === maxsize) {
          entries.shift()
        }
        entries.push([new Date().toISOString(), stringify(message)])
        listeners.get("NewMessage").forEach((func) => func(stringify(message)))
      }
    }

    return message;
  }

  this.getEntries = () => {
    return Array.from(entries).reverse()
  }

  this.removeEntries = () => {
    entries = []
  }

  this.addEventListener = (event, func) => {
    listeners.get(event).push(func)
  }

  this.removeEventListener = (event, func) => {
    const funcs = listeners.get(event)
    Array.from(funcs).forEach((f, index) => {
      if(f === func)
        delete(funcs[index])
    })
  }

  return this
}
