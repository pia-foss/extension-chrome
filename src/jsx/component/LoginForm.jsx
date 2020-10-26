import PropTypes from 'prop-types';
import Switch from '@component/Switch';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import LoginField from '@component/LoginField';
import withAppContext from '@hoc/withAppContext';
import RememberMeCheckbox from '@component/checkbox/RememberMeCheckbox';

class LoginForm extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.user = this.app.util.user;
    this.state = {
      username: this.user.getUsername(),
      password: '',
      errorText: '',
      loading: false,
    };

    // bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange({ target: { value, name } }) {
    switch (name) {
      case 'username': {
        this.user.setUsername(value);
        this.setState({ username: value });
        break;
      }

      case 'password': {
        this.setState({ password: value });
        break;
      }

      default: {
        debug(`invalid name for login field: ${value}`);
      }
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ loading: true });
    const { username, password } = this.state;

    // try to authenticate user
    this.user.auth(username, password)
      .then(() => { this.history.push('/'); })
      .catch((res) => {
        let errorText = '';
        this.setState({ loading: false });

        switch (res.cause) {
          /* request complete but got something other than 200 status code */
          case 'status': {
            const { status, statusText } = res;
            if (status === 401) { errorText = t('WrongUsernameAndPassword'); }
            else if (status === 429) { errorText = t('TooManyRequestsError'); }
            else { errorText = t('UnexpectedServerResponse', { statusLine: `${status} ${statusText}` }); }
            break;
          }
          // In event other extension cancels request, not currently functional
          // requires 'abort' API in fetch
          case 'abort': {
            errorText = t('AbortError');
            break;
          }
          case 'offline': {
            errorText = t('OfflineError');
            break;
          }
          /* request expired */
          case 'timeout': {
            errorText = t('TimeoutError', { seconds: this.user.authTimeout / 1000 });
            break;
          }
          default: {
            errorText = t('UnknownError');
            break;
          }
        }

        this.setState({ errorText });
      });
  }

  render() {
    const { context: { theme } } = this.props;
    const {
      username,
      password,
      errorText,
      loading,
    } = this.state;

    return (
      <form className={`login-form ${theme}`} onSubmit={this.handleSubmit}>
        <div className={`text-danger ${errorText ? '' : 'hidden'}`}>
          { errorText }
        </div>

        <LoginField
          type="text"
          theme={theme}
          name="username"
          autoFocus={true}
          autocomplete="off"
          defaultValue={username}
          onChange={this.onInputChange}
          localeKey="UsernamePlaceholder"
        />

        <LoginField
          theme={theme}
          type="password"
          name="password"
          autocomplete="off"
          defaultValue={password}
          onChange={this.onInputChange}
          localeKey="PasswordPlaceholder"
        />

        <RememberMeCheckbox labelLocaleKey="RememberMe" />

        <button type="submit" className="btn btn-submit">
          <span className={`submit-text ${loading ? 'hidden' : ''}`}>
            { t('LoginText') }
          </span>

          <div className={`loader ${loading ? '' : 'hidden'}`}>
            <Switch
              theme={theme}
              mode="connecting"
              classes="waiting login"
              connection="disconnected"
              onToggleConnection={() => {}}
            />
          </div>
        </button>
      </form>
    );
  }
}

LoginForm.propTypes = {
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withAppContext(LoginForm));
