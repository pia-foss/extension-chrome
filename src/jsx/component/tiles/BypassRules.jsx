import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tile from '@component/tiles/Tile';
import withAppContext from '@hoc/withAppContext';

class BypassRules extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.bypasslist = this.app.util.bypasslist;
    this.regionlist = this.app.util.regionlist;
    this.state = { origin: '' };

    // bindings
    this.removeRule = this.removeRule.bind(this);
    this.ruleStatue = this.ruleIncluded.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  componentDidMount() {
    // set current tab's origin
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    }, ([tab]) => {
      if (!tab) { return this.setState({ origin: '' }); }
      const url = new URL(tab.url);
      return this.setState({ origin: url.origin });
    });
  }

  onChangeHandler(e) {
    const { value } = e.target;
    this.setState({ origin: value });
  }

  onClickHandler() {
    const { origin } = this.state;
    this.bypasslist.addUserRule(origin, true);
    this.setState({});
  }

  removeRule() {
    const region = this.regionlist.getSelectedRegion();
    if (!region) { return; }
    const { origin } = this.state;
    this.bypasslist.removeUserRule(origin,true);
    this.setState({});
  }

  ruleIncluded() {
    const { origin } = this.state;
    const rules = this.bypasslist.getUserRules();
    const included = rules.includes(origin);
    return included;
  }

  render() {
    const {
      saved,
      hideFlag,
      toggleTileSaved,
      context: { theme },
    } = this.props;
    const { origin } = this.state;
    const region = this.regionlist.getSelectedRegion();

    return (
      <Tile
        name="BypassRules"
        saved={saved}
        hideFlag={hideFlag}
        toggleTileSaved={toggleTileSaved}
      >
        <div className={`bypass-rules ${theme}`}>
          <div className="bypass-rules-header">
            <div className="bypass-rules-header-content">
              { t('AddToBypassRules') }
            </div>

            {
              this.ruleIncluded() ? (
                <div className={`bypass-rule-included image ${this.ruleIncluded() ? 'active' : ''}`}>
                  <img
                    alt={t('RuleAlreadyIncluded')}
                    title={t('RuleAlreadyIncluded')}
                    src="/images/selected_2x.png"
                  />
                </div>
              )
                : ''
            }

            {
              this.ruleIncluded() ? (
                <div className={`bypass-rule-included remove ${this.ruleIncluded() ? 'active' : ''}`}>
                  <button type="button" className="remove-rule" onClick={this.removeRule}>
                    { `- ${t('RemoveRule')}` }
                  </button>
                </div>
              )
                : ''
            }
          </div>

          <div className="bypass-rules-content">
            <div className="bypass-rules-add-container">
              <input className="add-rule-input" value={origin} onChange={this.onChangeHandler} />
              <button
                type="button"
                className="add-rule-btn"
                disabled={!region || this.ruleIncluded()}
                onClick={this.onClickHandler}
              >
                <p>
                  +
                </p>
              </button>
            </div>
          </div>
        </div>
      </Tile>
    );
  }
}

BypassRules.propTypes = {
  saved: PropTypes.bool.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

export default withAppContext(BypassRules);
