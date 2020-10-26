import React, { Component } from 'react';

const createErrorBoundary = (ReactClass) => {
  return class ErrorBoundary extends Component {
    constructor(props) {
      super(props);

      // init
      this.state = { isError: false, msg: '' };
    }

    componentDidCatch(err) {
      const msg = JSON.stringify(err, Object.getOwnPropertyNames(err));
      debug(msg);
      this.setState(() => { return { isError: true, msg }; });
    }

    render() {
      const { state: { isError } } = this;
      if (isError) {
        // TODO: translation?
        return <div className="error-boundary">error: check console</div>;
      }
      return <ReactClass {...this.props} />;
    }
  };
};

export default createErrorBoundary;
