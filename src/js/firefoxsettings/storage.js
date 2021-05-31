class Storage {
  constructor(app) {
    // Bindings
    this.hasItem = this.hasItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.removeItem = this.removeItem.bind(this);

    // Init
    this.app = app;
    this.stores = {
      [Storage.MEMORY]: window.sessionStorage,
      [Storage.LOCAL]: window.localStorage,
    };
  }

  /* ------------------------------------ */
  /*               Public                 */
  /* ------------------------------------ */

  hasItem(key, store = Storage.LOCAL) {
    if (Storage.validateStoreAndKey({ store, key })) {
      const item = this.getItem(key, store);
      return item !== null;
    }
    throw Storage.createOperationError('has');
  }

  getItem(key, store = Storage.LOCAL) {
    if (Storage.validateStoreAndKey({ store, key })) {
      return this.stores[store].getItem(key);
    }
    throw Storage.createOperationError('get');
  }

  setItem(key, value, store = Storage.LOCAL) {
    if (Storage.validateStoreAndKey({ store, key })) {
      let storageValue;
      if (typeof value === 'undefined' || value === null) {
        storageValue = '';
      }
      else {
        storageValue = value;
      }
   
      this.stores[store].setItem(key, storageValue);
    }
    else {
      throw Storage.createOperationError('set');
    }
  }

  removeItem(key, store = Storage.LOCAL) {
    if (Storage.validateStoreAndKey({ store, key })) {
      this.stores[store].removeItem(key);
    }
    else {
      throw Storage.createOperationError('remove');
    }
  }

  /* ------------------------------------ */
  /*               Static                 */
  /* ------------------------------------ */

  static validateStore(store) {
    switch (store) {
      case Storage.LOCAL:
      case Storage.MEMORY:
        return true;

      default:
        debug(`no such storage type: ${store}`);
        return false;
    }
  }

  static validateKey(key) {
    const type = typeof key;
    const isString = type === 'string';
    const isEmpty = isString && !key;
    if (!isString || isEmpty) {
      let msg = 'key must be a valid string. ';
      if (!isString) {
        msg += `was: ${type}`;
      }
      else {
        msg += 'was: empty string';
      }
      console.debug(msg);
      return false;
    }
    return true;
  }

  static validateStoreAndKey({ store, key }) {
    return Storage.validateStore(store) && Storage.validateKey(key);
  }

  static createOperationError(operation) {
    // Refer to errors thrown in validateStore or validateKey
    return new Error(`could not ${operation} item, see above error for more information`);
  }
}

Storage.LOCAL = 'localStorage';
Storage.MEMORY = 'memoryStorage';

export default Storage;
