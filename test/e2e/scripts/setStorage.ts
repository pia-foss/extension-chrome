import { Script } from '../core';

interface Payload {
  key: string;
  value: string;
}

/**
 * Set an item in storage
 *
 * @param {Payload} payload info
 * @param {string} payload.value Value to set
 * @param {string} payload.key storage key
 * @param {string} payload.location storage location
 * @param {Script} payload.script Script engine used to run
 */
function setStorage(script: Script, { value, key }: Payload) {
  return script.executeAsync<Payload, void>(
    ({ value, key }, done) => {
      chrome.runtime.getBackgroundPage((window: any) => {
        const { app } = window;
        app.util.storage.setItem(key, value);
        done(void 0);
      });
    },
    { value, key },
  );
}

export { setStorage };
