export default class Logger {
  constructor(app) {
    this.app = app;
    this.entries = [];
    this.MAX_LOG_SIZE = 200;
    this.listeners = new Map([
      ['NewMessage', []]
    ]);

    // bindings
    this.debug = this.debug.bind(this);
    this.getEntries = this.getEntries.bind(this);
    this.removeEntries = this.removeEntries.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.stringify = this.stringify.bind(this);
  }

  debug (message, condition) {
    if (this.app.util.settings.getItem('debugmode') && (!condition || condition())) {
      // remove extraneous entries
      while (this.entries.length >= this.MAX_LOG_SIZE) { this.entries.shift(); }

      // add this error to the debug log
      this.entries.push([new Date().toISOString(), this.stringify(message)]);

      // update any UIs with new debug messages
      this.listeners.get('NewMessage').forEach((listener) => {
        // try calling functions bound to 'NewMessage'
        try { listener(this.stringify(message)); }
        /**
         * NOTE: This will catch a bug where if the the user is on the debug log view
         * and resizes the window, the browser will kill the extension without giving
         * the extension enough time to clear out the functions tied to the debug log.
         */
        catch (err) { this.removeEventListener('NewMessage', listener); }
      });
    }

    return message;
  }

  getEntries () {
    return Array.from(this.entries).reverse();
  }

  removeEntries () {
    this.entries = [];
  }

  addEventListener (event, listener) {
    this.listeners.get(event).push(listener);
  }

  removeEventListener (event, listener) {
    const currentListeners = this.listeners.get(event);
    let filteredListeners = currentListeners.filter((item) => {
      return item !== listener;
    });
    this.listeners.set(event, filteredListeners);
  }

  stringify (message) {
    if(typeof(message) === 'string') { return message; }
    else { return JSON.stringify(message); }
  }
}
