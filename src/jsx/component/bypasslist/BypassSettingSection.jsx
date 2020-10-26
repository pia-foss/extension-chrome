import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withAppContext from '@hoc/withAppContext';

class BypassSettingSection extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.bypasslist = this.app.util.bypasslist;
    this.i18n = this.app.util.i18n;
    // bindings
    this.renderBypassPage = this.renderBypassPage.bind(this);
  }

  renderBypassPage() {
    return this.history.push('/bypasslist');
  }

  render() {
    let listDetails = '';
    const { context: { theme } } = this.props;
    const count = this.bypasslist.visibleSize();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';
    if (count === 0) { listDetails = t('NoRulesAdded'); }
    else if (count === 1) { listDetails = t('OneRuleAdded'); }
    else { listDetails = t('MultipleRulesAdded', { count }); }

    return (
      <div className={`section-wrapper bypass ${theme} ${lang}`}>
        <div
          role="button"
          tabIndex="-1"
          className="section-header noselect"
          onClick={this.renderBypassPage}
          onKeyPress={this.renderBypassPage}
        >
          <span className="section-label">
            { t('ProxyBypassList') }
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

BypassSettingSection.propTypes = {
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withAppContext(BypassSettingSection));
