import { Script } from '../core';
import { StorageType } from '../types';

interface Payload {
  key: string;
  storage?: StorageType;
}

/**
 * Fetch an item from storage
 *
 * @param {string} key storage key
 * @param {string} location storage location
 * @param {Script} script Script engine used to run
 */
function getStorage(script: Script, key: string, storage?: StorageType) {
  return script.executeAsync<Payload, string | null>(
    ({ key, storage }, done) => {
      chrome.runtime.getBackgroundPage((window: any) => {
        const { app } = window;
        const result = app.util.storage.getItem(key, storage);

        done(result);
      });
    },
    { key, storage },
  );
}

export { getStorage };
