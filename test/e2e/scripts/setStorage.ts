import { Script } from '../core';
import { StorageType } from '../types';

interface Payload {
  key: string;
  value: string;
  storage?: StorageType;
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
function setStorage(script: Script, { value, key, storage }: Payload) {
  return script.executeAsync<Payload, void>(
    ({ value, key, storage }, done) => {
      chrome.runtime.getBackgroundPage((window: any) => {
        const { app } = window;
        app.util.storage.setItem(
          key,
          value,
          storage || app.util.user.storageBackend(),
        );
        done(void 0);
      });
    },
    { value, key, storage },
  );
}

export { setStorage };
