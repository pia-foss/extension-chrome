import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import withAppContext from '@hoc/withAppContext';

class PrivateRoute extends Component {
  constructor(props) {
    super(props);

    this.app = props.context.app;
    this.renderProps = this.renderProps.bind(this);
  }

  renderProps(props) {
    const isLoggedIn = this.app.util.user.getLoggedIn();

    if (isLoggedIn) {
      const thisProps = this.props;
      const ChildComponent = thisProps.component;
      return <ChildComponent {...props} />;
    }

    // disable proxy if not authenticated
    this.app.proxy.disable();
    // redirect to login page
    const loginComponent = { pathname: '/login', state: { from: props.location } };
    return <Redirect to={loginComponent} />;
  }

  render() {
    const modifiedProps = Object.assign({}, this.props);
    delete modifiedProps.component; // need to remove component to use renderProps
    return <Route {...modifiedProps} render={this.renderProps} />;
  }
}

PrivateRoute.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(PrivateRoute);
