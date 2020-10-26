import { createContext } from 'react';

const FOREGROUND = 'foreground';
const context = createContext({
  app: {},
  theme: 'dark',
  rebuildApp: () => {},
  updateTheme: () => {},
});

class AppContext {
  constructor(contextUpdate) {
    // properties
    this.id = FOREGROUND;
    this.rebuildApp = contextUpdate;
    this.app = chrome.extension.getBackgroundPage().app;

    // bindings
    this.updateTheme = this.updateTheme.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);

    // handle setting theme on extension body
    this.theme = this.app.util.settings.getItem('darkTheme') ? 'dark' : 'light';
    if (this.theme === 'dark') { document.body.classList.add('dark'); }

    // add runtime message handler
    chrome.runtime.onMessage.addListener(this.receiveMessage);
  }

  // helper function to updateTheme and context from nested component
  updateTheme(newTheme) {
    if (!(newTheme === 'dark' || newTheme === 'light')) { return; }

    // handle converting string back to boolean
    this.theme = newTheme;
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
      this.app.util.settings.setItem('darkTheme', true);
    }
    else {
      document.body.classList.remove('dark');
      this.app.util.settings.setItem('darkTheme', false);
    }

    // update app
    this.rebuildApp();
  }

  receiveMessage(message) {
    if (message.target !== this.id) { return false; }
    if (message.type !== 'refresh') { return false; }

    // refresh app data
    this.rebuildApp();
    return false;
  }

  // context builder helper function
  build() {
    return {
      app: this.app,
      theme: this.theme,
      rebuildApp: this.rebuildApp,
      updateTheme: this.updateTheme,
    };
  }
}

export default AppContext;
export const AppProvider = context.Provider;
export const AppConsumer = context.Consumer;
