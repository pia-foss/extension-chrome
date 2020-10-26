import { Script } from '../core';

interface Payload {
  key: string;
}

/**
 * Fetch an item from storage
 *
 * @param {string} key storage key
 * @param {string} location storage location
 * @param {Script} script Script engine used to run
 */
function getStorage(script: Script, key: string) {
  return script.executeAsync<Payload, string | null>(
    ({ key }, done) => {
      chrome.runtime.getBackgroundPage((window: any) => {
        const { app } = window;
        const result = app.util.storage.getItem(key);

        done(result);
      });
    },
    { key },
  );
}

export { getStorage };
