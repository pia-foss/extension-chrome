import isDev from '@helpers/isDev';

function getLegacyInfo() {
  return [
    { key: 'app::justInTimeDismissed', type: 'bool' },
    { key: 'form:password', type: 'string' },
    { key: 'sameAppBrowser', type: 'string' },
    { key: 'form:username', type: 'string' },
    { key: 'showFavorites', type: 'bool' },
    { key: 'connectionIndex', type: 'number' },
    { key: 'sortby', type: 'string' },
    { key: 'visibleISOs', type: 'object' },
    { key: 'favoriteregions', type: 'string' },
    { key: 'locale', type: 'string' },
    { key: 'account', type: 'object' },
    { key: 'authToken', type: 'string' },
    { key: 'autoRegion', type: 'bool' },
    { key: 'bypasslist:customlist', type: 'string' },
    { key: 'bypasslist:popularrules', type: 'string' },
    { key: 'drawerState', type: 'string' },
    { key: 'https-upgrade::last-timestamp', type: 'number' },
    { key: 'https-upgrade::last-updated', type: 'number' },
    { key: 'https-upgrade::storage-count', type: 'number' },
    { key: 'loggedIn', type: 'bool' },
    { key: 'online', type: 'bool' },
    { key: 'region', type: 'object' },
    { key: 'checkSmartLocation', type: 'bool' },
    { key: 'smartLocationRules', type: 'object' },
    { key: 'regionlist::override', type: 'object' },
    { key: 'settings:allowExtensionNotifications', type: 'bool' },
    // { key: 'settings:blockadobeflash', type: 'bool' },
    { key: 'settings:blockautofill', type: 'bool' },
    { key: 'settings:blockautofilladdress', type: 'bool' },
    { key: 'settings:blockautofillcreditcard', type: 'bool' },
    { key: 'settings:blockcamera', type: 'bool' },
    { key: 'settings:blockfbclid', type: 'bool' },
    { key: 'settings:blockhyperlinkaudit', type: 'bool' },
    { key: 'settings:blocklocation', type: 'bool' },
    { key: 'settings:blockmicrophone', type: 'bool' },
    { key: 'settings:blocknetworkprediction', type: 'bool' },
    { key: 'settings:blockplugins', type: 'bool' },
    { key: 'settings:blockreferer', type: 'bool' },
    { key: 'settings:blocksafebrowsing', type: 'bool' },
    { key: 'settings:blockthirdpartycookies', type: 'bool' },
    { key: 'settings:trackingprotection', type: 'bool' },
    { key: 'settings:fingerprintprotection', type: 'bool' },
    { key: 'settings:blockutm', type: 'bool' },
    { key: 'settings:darkTheme', type: 'bool' },
    { key: 'settings:debugmode', type: 'bool' },
    { key: 'settings:httpsUpgrade', type: 'bool' },
    { key: 'settings:maceprotection', type: 'bool' },
    { key: 'settings:preventwebrtcleak', type: 'bool' },
    { key: 'settings:rememberme', type: 'bool' },
    { key: 'settings:firstRun', type: 'bool' },
    { key: 'tiles', type: 'object' },
  ];
}

function getKeys() {
  const modernKeys = [
    'storage::migrated',
    'settings:alwaysActive',
  ];

  const legacyKeys = getLegacyInfo()
    .map((info) => { return info.key; });

  return [...modernKeys, ...legacyKeys];
}

/**
 * copy a value
 *
 * @template T
 * @param {T} value
 *
 * @returns {T}
 */
function copyValue(value) {
  switch (typeof value) {
    // cannot handle undefined
    case 'undefined': return undefined;
    // primitives are passed as copied anyways
    case 'string': return value;
    case 'boolean': return value;
    case 'number': return value;
    // other (null/object), use JSON to copy
    default: return JSON.parse(JSON.stringify(value));
  }
}

/**
 * Storage
 *
 * Responsible for storing values using known keys either in
 * WebExtension storage (default) or in memory
 *
 * Under the covers, stores everything in memory but will backup
 * to WebExtension storage if persistence is desired
 *
 * At this time does not support dynamic keys
 *
 * The following are properties of Storage:
 * - "undefined" values are considered missing
 * - "null" values are considered present
 * - values stored are copies of the values given
 * - values retreived are copied of the values stored
 * - values are copied using: JSON.stringify -> JSON.parse, meaning:
 *   - circular objects will error out
 *   - functions will be stripped on stored object
 *   - items in storage are immutable (IMPORTANT, would present bugs otherwise)
 */
class Storage {
  constructor() {
    // bindings
    this.hasItem = this.hasItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.init = this.init.bind(this);
    this.getItems = this.getItems.bind(this);
    this.store = {};
  }

  /*------------------------------------------*/
  /*                Public                    */
  /*------------------------------------------*/

  async init() {
    let migrated;
    // debug is not defined yet (depends on storage)
    const debug = (msg) => {
      if (isDev()) {
        // eslint-disable-next-line no-console
        console.log(msg);
      }
    };
    try {
      migrated = await new Promise((resolve, reject) => {
        chrome.storage.local.get('storage::migrated', (data) => {
          if (chrome.runtime.lastError) {
            debug('storage.js: failed to determine migrated status');
            reject(chrome.runtime.lastError);
          }
          else {
            resolve(data['storage::migrated']);
          }
        });
      });
    }
    catch (_) {
      // if there is an error, user will lose previous data
      // but extension will continue to function
      // (they will need to login & set preferences again)
      migrated = true;
    }
    if (migrated) {
      // load items from persistent storage
      debug('storage.js: loading data from chrome.local');
      try {
        await new Promise((resolve, reject) => {
          chrome.storage.local.get(getKeys(), (data) => {
            if (chrome.runtime.lastError) {
              debug('storage.js: failed to retrieve items from persistent storage');
              reject(chrome.runtime.lastError);
            }
            else {
              Object.keys(data).forEach((key) => {
                // all data keys should be strings
                if (key) {
                  this.store[key] = data[key];
                }
              });
              resolve();
            }
          });
        });
        debug('storage.js: successfully loaded data from chrome.local');
      }
      catch (err) {
        if (debug) {
          debug('storage.js: failed to load chrome.local');
          debug(err);
        }
      }
    }
    else {
      debug('storage.js: migrating');
      try {
        // move items from legacy storage to persistent storage
        const pendingMigration = getLegacyInfo().map(async ({ key, type }) => {
          const fromLocalStorage = localStorage.getItem(key);
          if (fromLocalStorage === null) { return Promise.resolve(); }
          if (typeof fromLocalStorage === 'undefined') { return Promise.resolve(); }
          if (fromLocalStorage === '' && type !== 'string') {
            // empty string values for non-string types should be undefined
            return Promise.resolve();
          }
          switch (type) {
            case 'object': {
              return this.setItem(key, JSON.parse(fromLocalStorage));
            }
            case 'bool': {
              return this.setItem(key, fromLocalStorage === String(true));
            }
            case 'number': {
              return this.setItem(key, Number(fromLocalStorage));
            }
            case 'string': {
              return this.setItem(key, fromLocalStorage);
            }
            default: throw new Error(`storage: migration invalid type: ${type}`);
          }
        });
        await Promise.all(pendingMigration);
        await this.setItem('storage::migrated', true);
        window.localStorage.clear();
        debug('storage.js: successfully migrated data');
      }
      catch (err) {
        if (debug) {
          debug('storage.js: failed to migrate localStorage to chrome.storage.local');
          debug(err);
        }
        try {
          await this.setItem('storage::migrated', true);
        }
        catch (_) { /* noop */ }
      }
    }
  }

  hasItem(key) {
    if (Storage.validateKey(key)) {
      const item = this.getItem(key);
      return typeof item !== 'undefined';
    }
    throw Storage.createOperationError('has');
  }

  getItem(key) {
    if (Storage.validateKey(key)) {
      const value = this.store[key];
      return copyValue(value);
    }
    throw Storage.createOperationError('get');
  }

  setItem(key, value) {
    // create a copy to work with
    const copy = copyValue(value);
    if (Storage.validateKey(key)) {
      if (typeof copy === 'undefined') {
        debug(`storage.js: attempt to store undefined for key ${key}`);
        return;
      }
      this.store[key] = copy;
      chrome.storage.local.set({ [key]: copy }, () => {
        if (chrome.runtime.lastError) {
          debug(`storage.js: failed to set ${key} in persistent storage`);
          debug(chrome.runtime.lastError);
        }
      });
      return;
    }
    throw Storage.createOperationError('set');
  }

  removeItem(key) {
    if (Storage.validateKey(key)) {
      delete this.store[key];
      // remove from persistent storage if needed
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          debug(`storage.js: failed to remove ${key} in persistent storage`);
          debug(chrome.runtime.lastError);
        }
      });
    }
    else {
      throw Storage.createOperationError('remove');
    }
  }

  /**
   * Get items in store for debugging purposes
   *
   * @returns {string}
   */
  getItems() {
    return JSON.stringify(this.store, null, 2);
  }

  /*------------------------------------------*/
  /*                Static                    */
  /*------------------------------------------*/

  static validateKey(key) {
    const valid = !!getKeys().find((k) => { return k === key; });
    if (!valid) {
      debug(`storage.js: invalid key: ${key}`);
    }
    return valid;
  }

  static validateStoreAndKey({ store, key }) {
    return Storage.validateStore(store) && Storage.validateKey(key);
  }

  static createOperationError(operation) {
    // Refer to errors thrown in validateStore or validateKey
    return new Error(`could not call ${operation}Item, invalid store or key`);
  }
}

export default Storage;
