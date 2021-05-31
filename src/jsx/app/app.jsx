import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import '@style/pia';
import AppContext, { AppProvider } from '@contexts/AppContext';
import Routes, { Path } from '@routes';
import PrivateBrowsingPage from '@pages/PrivateBrowsingPage';

/**
 * App is the main entry point for the view on the foreground
 *
 * It does not actually setup the foreground "app", and only
 * pertains to the view
 */
class App extends Component {
  constructor(props) {
    super(props);

    // bindings
    this.history = props.history;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.contextUpdate = this.contextUpdate.bind(this);

    // get gloabl application context
    this.appContext = new AppContext(this.contextUpdate);

    // define inital state
    this.state = {
      lastKeyIsCtrl: false,
      context: this.appContext.build(),
    };

    // check if proxy is controllable
    let { app } = this.appContext;
    
    this.uncontrollable = !app.proxy.isControllable();
    if (this.uncontrollable) { setTimeout(() => { this.history.push(Path.uncontrollable); }, 0); }

    // check if this is the first time being run
    this.firstRun = app.util.settings.getItem('firstRun', true);

    if(typeof browser != "undefined"){
      browser.proxy.settings.get({})
      .then(({ value }) => {
          return browser.proxy.settings.set({ value });
        })
        .catch((err) => {
          if (err.toString() === 'Error: proxy.settings requires private browsing permission.') {
            this.setState({ privateRequired: true });
            setTimeout(() => { this.history.push(Path.privateBrowsing); }, 0);
          }
        });
      }

    
    // define inital state
    this.state = {
      lastKeyIsCtrl: false,
      privateRequired: this.privateRequired,
      firstRun: this.firstRun,
      context: this.appContext.build(),
    };

    // check for compatibility
    this.upgrade = !app.chromesettings.webrtc.blockable;
    if (this.upgrade) { setTimeout(() => { this.history.push(Path.upgrade); }, 0); }

    // add handleKeyDown to keydown listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  contextUpdate() {
    this.setState({ context: this.appContext.build() });
  }

  updateFirstRun() {
    const firstRun = this.app.util.settings.getItem('firstRun', true);
    this.setState({ firstRun });
  }

  handleKeyDown(event) {
    const { lastKeyIsCtrl } = this.state;
    const { history, location } = this.props;
    const KEYS = { ctrl: 'Control', d: 'd', rightArrow: 'ArrowRight' };

    // show debug log if ctrl + d
    const ctrlUsed = lastKeyIsCtrl || event.ctrlKey;
    if (ctrlUsed && event.key === KEYS.d) {
      if (location.pathname === Path.debugLog) {
        return history.goBack();
      }
      return history.push(Path.debugLog);
    }

    // show region override if (ctrl + shift + ->)
    if (event.ctrlKey && event.shiftKey && event.key === KEYS.rightArrow) {
      if (location.pathname === Path.regionOverride) {
        return history.goBack();
      }
      return history.push(Path.regionOverride);
    }

    // if control was pressed, keep track of that.
    if (event.key === KEYS.ctrl) {
      return this.setState({ lastKeyIsCtrl: true });
    }

    // otherwise reset the ctrl tracker
    return this.setState({ lastKeyIsCtrl: false });
  }

  render() {
    const { context, privateRequired } = this.state;
    if (privateRequired) {
      return (
        <AppProvider value={context}>
          <PrivateBrowsingPage />
        </AppProvider>
      );
    }

    return (
      <AppProvider value={context}>
        <Routes />
      </AppProvider>
    );
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(App);
