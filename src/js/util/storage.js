class Storage {
  constructor (app) {
    this._app = app;

    // bindings
    this.hasItem = this.hasItem.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.removeItem = this.removeItem.bind(this);

    // init
    this._stores = {
      [Storage.MEMORY]: window.sessionStorage,
      [Storage.LOCAL]: window.localStorage,
    };
  }

  _validateStore (store) {
    switch (store) {
      case Storage.LOCAL:
      case Storage.MEMORY:
        return true;

      default:
        console.error(debug(`no such store type: ${store}`));
        return false;
    }
  }

  _validateKey (key) {
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
      console.error(debug(msg));
      return false;
    }
    return true;
  }

  _validateStoreAndKey ({store, key}) {
    return this._validateStore(store) && this._validateKey(key);
  }

  _createOperationError (operation) {
    // Refer to errors thrown in _validateStore or _validateKey
    return new Error(`could not ${operation} item, see above error for more information`);
  }

  hasItem (key, store = Storage.LOCAL) {
    const item = this.getItem(key, store);
    return item !== null;
  }

  getItem (key, store = Storage.LOCAL) {
    if (this._validateStoreAndKey({store, key})) {
      return this._stores[store].getItem(key);
    }
    else {
      throw this._createOperationError('get');
    }
  }

  setItem (key, value, store = Storage.LOCAL) {
    if (this._validateStoreAndKey({store, key})) {
      if (typeof value === 'undefined' || value === null) {
        value = '';
      }
      this._stores[store].setItem(key, value);
    }
    else {
      throw this._createOperationError('set');
    }
  }

  removeItem (key, store = Storage.LOCAL) {
    if (this._validateStoreAndKey({store, key})) {
      this._stores[store].removeItem(key);
    }
    else {
      throw this._createOperationError('remove');
    }
  }
}

Storage.LOCAL = 'localStorage';
Storage.MEMORY = 'memoryStorage';

export default Storage;
