import Storage from '@util/storage';
import App from '@mocks/app';

describe('@util > storage', () => {
  let storage;
  let app;

  function set(key, value) {
    storage.store[key] = value;
  }

  function get(key) {
    return storage.store[key];
  }


  describe('#init', () => {
    let migrationData;

    beforeEach(async () => {
      // all string values (like localStorage)
      migrationData = {
        account: JSON.stringify({ value: 'object' }),
        authToken: 'string',
        autoRegion: 'true',
        'https-upgrade::storage-count': '11',
        region: '',
        online: '',
        'https-upgrade::last-timestamp': '',
        drawerState: '',
      };
      window.localStorage.getItem.mockImplementation((key) => {
        return migrationData[key];
      });
      chrome.storage.local.get.mockImplementation((_, cb) => {
        cb({
          'storage::migrated': false,
        });
      });
      chrome.storage.local.set.mockImplementation((_, cb) => { cb(); });
      app = new App();
      storage = new Storage(app);
      await storage.init();
    });

    it('should migrate strings', async () => {
      expect(storage.getItem('account')).toEqual({ value: 'object' });
    });

    it('should migrate objects', async () => {
      expect(storage.getItem('authToken')).toEqual('string');
    });

    it('should migrate numbers', async () => {
      expect(storage.getItem('autoRegion')).toEqual(true);
    });

    it('should migrate booleans', async () => {
      expect(storage.getItem('https-upgrade::storage-count')).toEqual(11);
    });

    it('should not migrate empty strings for expected objects', async () => {
      expect(storage.hasItem('region')).toEqual(false);
    });

    it('should not migrate empty strings for expected booleans', async () => {
      expect(storage.hasItem('online')).toEqual(false);
    });

    it('should not migrate empty strings for expected numbers', async () => {
      expect(storage.hasItem('https-upgrade::last-timestamp')).toEqual(false);
    });

    it('should migrate empty strings for expected strings', async () => {
      expect(storage.hasItem('drawerState')).toEqual(true);
    });
  });

  describe('#getItem', () => {
    beforeEach(async () => {
      app = new App();
      storage = new Storage(app);
    });

    it('rejects invalid key', async () => {
      let failed = false;
      try {
        storage.getItem('invalidKey');
      }
      catch (err) {
        failed = true;
      }
      expect(failed).toEqual(true);
    });

    it('retrieves copy of object from persistent store', async () => {
      // assign
      const key = 'region';
      const value = { aKey: 'test' };
      set(key, value);

      // act
      const result = storage.getItem(key);

      // assert
      expect(result).not.toBe(value);
      expect(result).toEqual(value);
    });

    it('retrieves copy of primitive from persistent store', async () => {
      // assign
      const key = 'authToken';
      const value = 'a string';
      set(key, value);

      // act
      const result = storage.getItem(key);

      // assert
      expect(result).toEqual(value);
    });
  });

  describe('#setItem', () => {
    beforeEach(async () => {
      app = new App();
      storage = new Storage(app);
      chrome.storage.local.set.mockImplementation((_, cb) => {
        cb();
      });
    });

    it('rejects invalid key', async () => {
      let failed = false;
      try {
        storage.setItem('invalidKey', null);
      }
      catch (err) {
        failed = true;
      }
      expect(failed).toEqual(true);
    });

    it('stores item in chrome.local for persistent mode', async () => {
      const key = 'region';
      const value = { hello: 'world' };
      storage.setItem(key, value);
      const [arg] = chrome.storage.local.set.mock.calls[0];
      expect(arg.region).toEqual(value);
    });

    it('stores item in appropriate store for persistent mode', async () => {
      const key = 'region';
      const value = { hello: 'world' };
      storage.setItem(key, value);
      const actual = get(key);
      expect(actual).toEqual(value);
    });

    it('stores null values as null', async () => {
      const key = 'region';
      const value = null;
      storage.setItem(key, value);
      const actual = get(key);
      expect(actual).toEqual(null);
    });

    it('ignores storing undefined values', async () => {
      const key = 'region';
      const value = undefined;
      storage.setItem(key, value);
      const storedKeys = Object.keys(storage.store);
      expect(storedKeys).not.toContainEqual('region');
    });

    it('creates copy of non-primitive values', async () => {
      const key = 'region';
      const value = { hello: 'world' };
      storage.setItem(key, value);
      const actual = get(key);
      expect(actual).not.toBe(value);
    });
  });

  describe('#hasItem', () => {
    beforeEach(async () => {
      app = new App();
      storage = new Storage(app);
    });

    it('rejects invalid key', async () => {
      let failed = false;
      try {
        storage.hasItem('invalidKey');
      }
      catch (err) {
        failed = true;
      }
      expect(failed).toEqual(true);
    });

    it('is false for undefined item', async () => {
      set('region', undefined);
      expect(storage.hasItem('region')).toEqual(false);
    });

    it('is true for null item', async () => {
      set('region', null);
      expect(storage.hasItem('region')).toEqual(true);
    });

    it('is true for empty string', async () => {
      set('authToken', '');
      expect(storage.hasItem('authToken')).toEqual(true);
    });

    it('is true for empty object', async () => {
      set('region', {});
      expect(storage.hasItem('region')).toEqual(true);
    });

    it('is true for empty array', async () => {
      set('region', []);
      expect(storage.hasItem('region')).toEqual(true);
    });
  });

  describe('#removeItem', () => {
    beforeEach(async () => {
      app = new App();
      storage = new Storage(app);
      chrome.storage.local.remove.mockImplementation((_, cb) => {
        cb();
      });
    });

    it('rejects invalid key', async () => {
      let failed = false;
      try {
        storage.removeItem('invalidKey');
      }
      catch (err) {
        failed = true;
      }
      expect(failed).toEqual(true);
    });

    it('removes item from appropriate store in persistent mode', async () => {
      set('region', { hello: 'world' });
      storage.removeItem('region');
      expect(get('region')).toEqual(undefined);
    });

    it('removes item from chrome.local in persistent mode', async () => {
      storage.removeItem('region');
      const [arg] = chrome.storage.local.remove.mock.calls[0];
      expect(arg).toEqual('region');
    });
  });
});
