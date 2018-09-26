import tinyhttp from 'tinyhttp';

const USERNAME_KEY = 'form:username';
const PASSWORD_KEY = 'form:password';
const LOGGED_IN_KEY = 'loggedIn';

class User {
  constructor (app) {
    // bindings
    this.storageBackend = this.storageBackend.bind(this);
    this.setRememberMe = this.setRememberMe.bind(this);
    this.getRememberMe = this.getRememberMe.bind(this);
    this.inLocalStorage = this.inLocalStorage.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.getPassword = this.getPassword.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.password = this.password.bind(this);
    this.username = this.username.bind(this);
    this.auth = this.auth.bind(this);
    this.logout = this.logout.bind(this);
    this._removeUsernameAndPasswordFromStorage = this._removeUsernameAndPasswordFromStorage.bind(this);
    this._removeLoggedInFromStorage = this._removeLoggedInFromStorage.bind(this);
    this._getLoggedInStorageItem = this._getLoggedInStorageItem.bind(this);
    this._setLoggedInStorageItem = this._setLoggedInStorageItem.bind(this);

    // init
    this._app = app;
    this._http = tinyhttp('https://www.privateinternetaccess.com');
    this.authed = false;
    this.authing = false;
    this.authTimeout = 5000;
  }

  get _storage () { return this._app.util.storage; }
  get _settings () { return this._app.util.settings; }
  get _icon () { return this._app.util.icon; }
  get _proxy () { return this._app.proxy; }

  get logOutOnClose () {
    return this._app.util.settings.getItem('logoutOnClose');
  }

  get loggedIn () {
    const loggedInStorageItem = this._getLoggedInStorageItem();
    const credentialsStored = Boolean(
      this.getUsername().length &&
      this.getPassword().length
    );
    if (loggedInStorageItem && !credentialsStored) {
      console.error(debug('user is expecting to be logged in, but no credentials exist'));
    }

    return loggedInStorageItem && credentialsStored;
  }

  _getLoggedInStorageItem () {
    return this._app.util.storage.getItem(LOGGED_IN_KEY, this.storageBackend()) === 'true';
  }

  _setLoggedInStorageItem (value) {
    this._app.util.storage.setItem(LOGGED_IN_KEY, Boolean(value), this.storageBackend());
  }

  _removeUsernameAndPasswordFromStorage () {
    this._storage.removeItem(USERNAME_KEY, this.storageBackend());
    this._storage.removeItem(PASSWORD_KEY, this.storageBackend());
  }

  _removeLoggedInFromStorage () {
    this._storage.removeItem(LOGGED_IN_KEY, this.storageBackend());
  }

  storageBackend () {
    return this._settings.getItem('rememberme') ? 'localStorage' : 'memoryStorage';
  }

  /**
   * Set the value of remember me, and swap credentials over to new storage medium
   *
   * @param {boolean} rememberMe Whether the user should be remembered past the current session
   *
   * @returns {void}
   */
  setRememberMe(rememberMe) {
    const prevRememberMe = this.getRememberMe();
    if (rememberMe !== prevRememberMe) {
      // Get from current storage medium
      const username = this.getUsername();
      const password = this.getPassword();
      const loggedIn = this._getLoggedInStorageItem();

      // Remove from current storage medium
      this._removeUsernameAndPasswordFromStorage();
      this._removeLoggedInFromStorage();

      // Swap storage
      this._settings.setItem('rememberme', Boolean(rememberMe));

      // Save in new storage medium
      this.setUsername(username);
      this.setPassword(password);
      this._setLoggedInStorageItem(loggedIn);
    }
  }

  getRememberMe() {
    return this._settings.getItem('rememberme');
  }

  inLocalStorage () {
    return this.storageBackend() === 'localStorage';
  }

  getUsername() {
    const username = this._storage.getItem(USERNAME_KEY, this.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  }

  getPassword() {
    const password = this._storage.getItem(PASSWORD_KEY, this.storageBackend());
    return password || '';
  }

  setUsername (username) {
    this._storage.setItem(USERNAME_KEY, username.trim(), this.storageBackend());
  }

  setPassword (password) {
    this._storage.setItem(PASSWORD_KEY, password, this.storageBackend());
  }

  password() {
    console.log('user.password() is deprecated, please use user.getPassword() instead');
    console.trace && console.trace();
    return this.getPassword();
  }

  username() {
    console.log('user.username() is deprecated, please use user.getUsername() instead');
    console.trace && console.trace();
    return this.getUsername();
  }

  auth () {
    const username = this.getUsername(),
          password = this.getPassword(),
          headers  = {"Authorization": `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`};
    debug("user.js: start auth");
    return this._http.head("/api/client/auth", {headers, timeout: this.authTimeout}).then((xhr) => {
      this.authing = false;
      this.authed = true;
      this._setLoggedInStorageItem(true);
      this._icon.updateTooltip();
      debug("user.js: auth ok");
      return xhr;
    }).catch((xhr) => {
      this._setLoggedInStorageItem(false);
      this.authing = false;
      this.authed = false;
      debug(`user.js: auth error, ${xhr.tinyhttp.cause}`);
      throw(xhr);
    });
  }

  logout (afterLogout) { /* FIXME: remove callback for promise chaining. */
    return this._proxy.disable().then(() => {
      this.authed = false;
      if (!this.getRememberMe()) {
        this._removeUsernameAndPasswordFromStorage();
      }
      this._setLoggedInStorageItem(false);
      this._icon.updateTooltip();
      if (afterLogout) {
        afterLogout();
      }
    });
  }
}

export default User;
