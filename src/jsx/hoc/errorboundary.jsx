import React, {Component} from 'react';

const createErrorBoundary = function (ReactClass) {
  return class ErrorBoundary extends Component {
    constructor(props) {
      super(props);

      // init
      this.state = {isError: false, msg: ''};
    }

    componentDidCatch (err) {
      const msg = JSON.stringify(err, Object.getOwnPropertyNames(err));
      debug(msg);
      this.setState(() => ({isError: true, msg}));
    }

    render () {
      if (this.state.isError) {
        return <div className="error-boundary">error: check console</div>;
      }
      else {
        return <ReactClass {...this.props} />;
      }
    }
  };
};

export default createErrorBoundary;
