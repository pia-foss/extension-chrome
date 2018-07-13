import tinyhttp from 'tinyhttp';

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
    this.removeUsernameAndPasswordFromStorage = this.removeUsernameAndPasswordFromStorage.bind(this);
    this.inStorage = this.inStorage.bind(this);
    this.auth = this.auth.bind(this);
    this.logout = this.logout.bind(this);

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
      // Get username and password and remove from previous storage
      const username = this.getUsername();
      const password = this.getPassword();
      this.removeUsernameAndPasswordFromStorage();

      // Swap storage
      this._settings.setItem('rememberme', Boolean(rememberMe));

      // Set username and password in new storage
      this.setUsername(username);
      this.setPassword(password);
    }
  }

  getRememberMe() {
    return this._settings.getItem('rememberme');
  }

  inLocalStorage () {
    return this.storageBackend() === 'localStorage';
  }

  getUsername() {
    const username = this._storage.getItem('form:username', this.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  }

  getPassword() {
    const password = this._storage.getItem('form:password', this.storageBackend());
    return password || '';
  }

  setUsername (username) {
    this._storage.setItem('form:username', username.trim(), this.storageBackend());
  }

  setPassword (password) {
    this._storage.setItem('form:password', password, this.storageBackend());
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

  removeUsernameAndPasswordFromStorage () {
    this._storage.removeItem('form:username', this.storageBackend());
    this._storage.removeItem('form:password', this.storageBackend());
  }

  inStorage () {
    return this.getUsername().length > 0 && this.getPassword().length > 0;
  }

  auth () {
    const username = this.username(),
          password = this.password(),
          headers  = {"Authorization": `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`};
    debug("user.js: start auth");
    return this._http.head("/api/client/auth", {headers, timeout: this.authTimeout}).then((xhr) => {
      this.authing = false;
      this.authed = true;
      this._icon.updateTooltip();
      debug("user.js: auth ok");
      return xhr;
    }).catch((xhr) => {
      this.authing = false;
      this.authed = false;
      debug(`user.js: auth error, ${xhr.tinyhttp.cause}`);
      throw(xhr);
    });
  }

  logout (afterLogout) { /* FIXME: remove callback for promise chaining. */
    return this._proxy.disable().then(() => {
      this.authed = false;
      this.removeUsernameAndPasswordFromStorage();
      this._icon.updateTooltip();
      if (afterLogout) {
        afterLogout();
      }
    });
  }
}

export default User;
