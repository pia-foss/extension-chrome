import http from 'helpers/http';

const USERNAME_KEY = 'form:username';
const PASSWORD_KEY = 'form:password';
const LOGGED_IN_KEY = 'loggedIn';

class User {
  constructor(app) {
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
    this.removeUsernameAndPasswordFromStorage = this
      .removeUsernameAndPasswordFromStorage.bind(this);
    this.removeLoggedInFromStorage = this.removeLoggedInFromStorage.bind(this);
    this.getLoggedInStorageItem = this.getLoggedInStorageItem.bind(this);
    this.setLoggedInStorageItem = this.setLoggedInStorageItem.bind(this);

    // init
    this.app = app;
    this.authed = false;
    this.authing = false;
    this.authTimeout = 5000;
  }

  get storage() { return this.app.util.storage; }

  get settings() { return this.app.util.settings; }

  get icon() { return this.app.util.icon; }

  get proxy() { return this.app.proxy; }

  get logOutOnClose() {
    return this.app.util.settings.getItem('logoutOnClose');
  }

  get loggedIn() {
    const loggedInStorageItem = this.getLoggedInStorageItem();
    const credentialsStored = Boolean(
      this.getUsername().length
      && this.getPassword().length,
    );
    if (loggedInStorageItem && !credentialsStored) {
      console.error(debug('user is expecting to be logged in, but no credentials exist'));
    }

    return loggedInStorageItem && credentialsStored;
  }

  getLoggedInStorageItem() {
    return this.app.util.storage.getItem(LOGGED_IN_KEY, this.storageBackend()) === 'true';
  }

  setLoggedInStorageItem(value) {
    this.app.util.storage.setItem(LOGGED_IN_KEY, Boolean(value), this.storageBackend());
  }

  removeUsernameAndPasswordFromStorage() {
    this.storage.removeItem(USERNAME_KEY, this.storageBackend());
    this.storage.removeItem(PASSWORD_KEY, this.storageBackend());
  }

  removeLoggedInFromStorage() {
    this.storage.removeItem(LOGGED_IN_KEY, this.storageBackend());
  }

  storageBackend() {
    return this.settings.getItem('rememberme') ? 'localStorage' : 'memoryStorage';
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
      const loggedIn = this.getLoggedInStorageItem();

      // Remove from current storage medium
      this.removeUsernameAndPasswordFromStorage();
      this.removeLoggedInFromStorage();

      // Swap storage
      this.settings.setItem('rememberme', Boolean(rememberMe));

      // Save in new storage medium
      this.setUsername(username);
      this.setPassword(password);
      this.setLoggedInStorageItem(loggedIn);
    }
  }

  getRememberMe() {
    return this.settings.getItem('rememberme');
  }

  inLocalStorage() {
    return this.storageBackend() === 'localStorage';
  }

  getUsername() {
    const username = this.storage.getItem(USERNAME_KEY, this.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  }

  getPassword() {
    const password = this.storage.getItem(PASSWORD_KEY, this.storageBackend());
    return password || '';
  }

  setUsername(username) {
    this.storage.setItem(USERNAME_KEY, username.trim(), this.storageBackend());
  }

  setPassword(password) {
    this.storage.setItem(PASSWORD_KEY, password, this.storageBackend());
  }

  password() {
    console.log('user.password() is deprecated, please use user.getPassword() instead');
    if (console.trace) { console.trace(); }
    return this.getPassword();
  }

  username() {
    console.log('user.username() is deprecated, please use user.getUsername() instead');
    if (console.trace) { console.trace(); }
    return this.getUsername();
  }

  auth() {
    const username = this.getUsername();
    const password = this.getPassword();
    const headers = { Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}` };
    debug('user.js: start auth');
    return http.head('https://www.privateinternetaccess.com/api/client/auth', { headers, timeout: this.authTimeout })
      .then((res) => {
        this.authing = false;
        this.authed = true;
        this.setLoggedInStorageItem(true);
        this.icon.updateTooltip();
        debug('user.js: auth ok');

        return res;
      })
      .catch((res) => {
        this.setLoggedInStorageItem(false);
        this.authing = false;
        this.authed = false;
        debug(`user.js: auth error, ${res.cause}`);

        throw res;
      });
  }

  logout(afterLogout) { /* FIXME: remove callback for promise chaining. */
    return this.proxy.disable().then(() => {
      this.authed = false;
      if (!this.getRememberMe()) {
        this.removeUsernameAndPasswordFromStorage();
      }
      this.setLoggedInStorageItem(false);
      this.icon.updateTooltip();
      if (afterLogout) {
        afterLogout();
      }
    });
  }
}

export default User;
