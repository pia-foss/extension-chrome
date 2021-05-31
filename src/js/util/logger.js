import isDev from '@helpers/isDev';

/**
 * The logger collects useful information from the extension
 * for debugging purposes.
 *
 * IMPORTANT: only active when setting is enabled (disabled by default)
 * IMPORTANT: only development builds log to console (not qa, beta or release)
 */
export default class Logger {
  constructor(app) {
    this.app = app;
    this.entries = [];
    this.MAX_LOG_SIZE = 200;

    // bindings
    this.debug = this.debug.bind(this);
    this.getEntries = this.getEntries.bind(this);
  }

  debug(message, condition) {
    if (condition && !condition()) {
      return message;
    }
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
    if (this.app.util.settings.getItem('debugmode')) {
      // remove extraneous entries
      while (this.entries.length >= this.MAX_LOG_SIZE) { this.entries.shift(); }

      // add this error to the debug log
      this.entries.push([new Date().toISOString(), Logger.stringify(message)]);

      // update any UIs with new debug messages
      if(typeof browser == 'undefined'){
        this.app.courier.sendMessage('refresh');
      }
    }

    return message;
  }

  getEntries() {
    return Array.from(this.entries).reverse();
  }

  removeEntries() {
    this.entries = [];
    if(typeof browser == 'undefined'){
      this.app.courier.sendMessage('refresh');
    }
  }

  static stringify(message) {
    if (typeof (message) === 'string') { return message; }
    return JSON.stringify(message);
  }
}
