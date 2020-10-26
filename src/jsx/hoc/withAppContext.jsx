import React from 'react';

import { AppConsumer } from '@contexts/AppContext';

/**
 * Higher Order Component that injects the application context
 * into the nested component
 */
function withAppContext(ChildComponent) {
  function injector(props) {
    return (
      <AppConsumer>
        { (context) => { return <ChildComponent context={context} {...props} />; } }
      </AppConsumer>
    );
  }
  return injector;
}

export default withAppContext;
