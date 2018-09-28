import React, { Component } from 'react';

class LogoutButton extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.renderer = background.renderer;
    this.app = background.app;

    // properties
    this.user = this.app.util.user;

    // bindings
    this.logout = this.logout.bind(this);
  }

  logout() {
    return this.user.logout()
      .then(() => { return this.renderer.renderTemplate('login'); });
  }

  render() {
    return (
      <div
        title={t('LogoutText')}
        role="button"
        tabIndex="-1"
        onClick={this.logout}
        onKeyPress={this.logout}
        className="col-xs-3 btn-icon btn-logout btn btn-external"
      >
        <div className="popover darkpopover arrow-bottom">
          { t('LogoutText') }
        </div>
      </div>
    );
  }
}

export default LogoutButton;
