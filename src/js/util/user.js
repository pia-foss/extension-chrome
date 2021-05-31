import http from '@helpers/http';

const USERNAME_KEY = 'form:username';
const PASSWORD_KEY = 'form:password';
const LOGGED_IN_KEY = 'loggedIn';
const REMEMBER_ME_KEY = 'rememberme';
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TIMEOUT = 5000;
const AUTH_ENDPOINT = 'https://www.privateinternetaccess.com/api/client/v2/token';
const ACCOUNT_ENDPOINT = 'https://www.privateinternetaccess.com/api/client/v2/account';

/**
 * Controls user information and authentication in
 * the extension
 */
class User {
  constructor(app,foreground = false) {
    // bindings
    this.getLoggedIn = this.getLoggedIn.bind(this);
    this.setLoggedIn = this.setLoggedIn.bind(this);
    this.getRememberMe = this.getRememberMe.bind(this);
    this.setRememberMe = this.setRememberMe.bind(this);
    this.checkUserName = this.checkUserName.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.getPassword = this.getPassword.bind(this);
    this.getAuthToken = this.getAuthToken.bind(this);
    this.setAuthToken = this.setAuthToken.bind(this);
    this.setAccount = this.setAccount.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.auth = this.auth.bind(this);
    this.logout = this.logout.bind(this);
    this.init = this.init.bind(this);

    // init
    this.app = app;
    this.foreground = foreground;
    this.authTimeout = 5000;

    // handle getting account info from storage
    this.account = undefined;
    const account = this.storage.getItem('account');
    if (account) {
      this.account = account;
    }

    // get credentials and loggedIn from storage
    const { util: { storage } } = app;
    this.username = storage.getItem(USERNAME_KEY) || '';
    this.authToken = storage.getItem(AUTH_TOKEN_KEY) || '';
    // init loggedIn, user#setLoggedIn relies on app to be initialized
    this.loggedIn = storage.getItem(LOGGED_IN_KEY)|| '';
  }
 
  /* ------------------------------------ */
  /*              Getters                 */
  /* ------------------------------------ */

  get storage() { return this.app.util.storage; }

  get adapter() { return this.app.adapter; }

  get settings() { return this.app.util.settings; }

  get icon() { return this.app.util.icon; }

  get proxy() { return this.app.proxy; }

  async init() {
    const { util: { storage } } = this.app;
    const password = storage.getItem(PASSWORD_KEY) || null;
    // If credentials exists and loggedIn, re-auth using token
    // NOTE: This should be removed after all users are no longer using the old auth system
    if (password && this.username && this.getLoggedIn()) {
      try { await this.auth(this.username, password); }
      catch (_) { this.setLoggedIn(false); }
    }
    else {
      // call setLoggedIn to setup other modules relying on user
      this.setLoggedIn(this.getLoggedIn());
    }
    // clear legacy password
    this.password = null;
    storage.removeItem(PASSWORD_KEY);
  }

  getLoggedIn() { return this.loggedIn; }

  setLoggedIn(value) {
    const { app: { util: { settingsmanager } } } = this;
    this.loggedIn = value;
    this.storage.setItem(LOGGED_IN_KEY, value);
    if (this.foreground && typeof browser != 'undefined') {
      this.adapter.sendMessage('util.user.setLoggedIn', { value });
    } else {
      if (value) {
        settingsmanager.enable();
      }
      else {
        settingsmanager.disable();
      }
    }
  }

  /**
   * Get whether or not username & token should be remembered
   */

  getRememberMe() { return this.settings.getItem(REMEMBER_ME_KEY); }

  setRememberMe(rememberMe) {
    let username = '';
    if (rememberMe) { username = this.getUsername(); }

    // update username and rememberMe in localStorage
    this.storage.setItem(USERNAME_KEY, username);
    this.settings.setItem(REMEMBER_ME_KEY, Boolean(rememberMe), this.foreground);

    if (this.foreground && typeof browser != 'undefined') {
      this.adapter.sendMessage('util.user.setRememberMe', { rememberMe });
    }
  }

  checkUserName(){
    if (!this.getRememberMe()) {
      this.username = '';
      this.storage.setItem(USERNAME_KEY, this.username);
    }
  }


  getUsername() { return this.username || ''; }

  setUsername(username) {
    this.username = username.trim();

    if (this.getRememberMe()) {
      this.storage.setItem(USERNAME_KEY, this.username);
    }

    if (this.foreground && typeof browser != 'undefined') {
      this.adapter.sendMessage('util.user.setUsername', { username: this.username });
    }
  }

  getPassword() { return this.password || ''; }

  getAuthToken() { return this.authToken || ''; }

  setAuthToken(authToken) {
    this.authToken = authToken;
    this.storage.setItem(AUTH_TOKEN_KEY, authToken);
    if (this.foreground && typeof browser != 'undefined') {
      this.adapter.sendMessage('util.user.setAuthToken', { authToken });
    }
  }

  setAccount(account) {
    if (!account) { return; }
    this.account = account;
    delete this.account.email;
    this.storage.setItem('account', account);
    if (this.foreground && typeof browser != 'undefined') {
      this.adapter.sendMessage('util.user.setAccount', account);
    }
  }

  /**
   * Update the account information for the user
   */
  updateAccount() {
    debug('user.js: start account info');
    const headers = { Authorization: `Token ${this.authToken}` };
    return http.get(ACCOUNT_ENDPOINT, { headers })
      .then((res) => {
        debug('user.js: account info ok');
        return res.json();
      })
      .then((body) => {
        this.setAccount(body);
        return body;
      })
      .catch((res) => {
        debug(`user.js: account info error, ${res.cause}`);
      });
  }

  /**
   * Authenticate with PIA's service
   */
  auth(rawUsername, password) {
    const username = rawUsername.trim();
    const body = JSON.stringify({ username, password });
    const headers = { 'Content-Type': 'application/json' };
    const options = { headers, body, timeout: AUTH_TIMEOUT };
    return http.post(AUTH_ENDPOINT, options)
      .then((res) => { return res.json(); })
      .then((resBody) => {
        // set user as authenticated
        this.setAuthToken(resBody.token);
        this.setLoggedIn(true);
        this.icon.updateTooltip();

        // update account information
        this.updateAccount();
        return resBody;
      })
      .catch((res) => {
        this.setLoggedIn(false);
        throw res;
      });
  }

  logout(cb) { /* FIXME: remove callback for promise chaining. */
    return this.proxy.disable()
      .then(() => {
        this.setLoggedIn(false);
        this.setAuthToken(null);
        this.icon.updateTooltip();
        if (cb) { cb(); }
      });
  }
}

export default User;
