import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withAppContext from '@hoc/withAppContext';


class SmartLocation extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.smartlocation = this.app.util.smartlocation;
    this.i18n = this.app.util.i18n;
    // bindings
    this.renderSmartLocationPage = this.renderSmartLocationPage.bind(this);
  }

  renderSmartLocationPage() {
    return this.history.push('/smartlocation');
  }

  render() {
    let listDetails = '';
    const { context: { theme } } = this.props;
    const count = this.smartlocation.visibleSize();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';
    if (count === 0) { listDetails = t('NoLocation'); }
    else if(count === 1){listDetails = count + " " +t('OneLocation'); }
    else { listDetails = listDetails = count + " " +t('MultipleLocations'); }

    return (
      <div className={`section-wrapper bypass ${theme} ${lang}`}>
        <div
          role="button"
          tabIndex="-1"
          className="section-header noselect"
          onClick={this.renderSmartLocationPage}
          onKeyPress={this.renderSmartLocationPage}
        >
          <span className="section-label">
            { t('SmartLocation') }
          </span>

          <div className="rightalign">
            <span className="counts">
              { listDetails }
            </span>

            <span className="expandicon lefticon" />
          </div>
        </div>
      </div>
    );
  }
}

SmartLocation.propTypes = {
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withAppContext(SmartLocation));
