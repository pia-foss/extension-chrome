import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PageTitle from '@component/PageTitle';
import withAppContext from '@hoc/withAppContext';
import ExtraFeaturesSection from '@component/ExtraFeaturesSection';

class ExtraFeaturesPage extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.history = props.history;
    this.buildinfo = this.app.buildinfo;
    this.settings = this.app.util.settings;
    this.updateTheme = props.context.updateTheme;

    // bindings
    this.buildInfo = this.buildInfo.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.onDebugClick = this.onDebugClick.bind(this);
    this.viewChangeLog = this.viewChangeLog.bind(this);
  }

  onDebugClick() {
    return this.history.push('/debuglog');
  }

  changeTheme() {
    // update state
    const { context: { theme } } = this.props;
    if (theme === 'dark') { this.updateTheme('light'); }
    else { this.updateTheme('dark'); }
  }

  viewChangeLog() {
    return this.history.push('/changelog');
  }

  buildInfo() {
    const { gitcommit, gitbranch, name } = this.buildinfo;
    const numValidHashes = [gitcommit, gitbranch]
      .filter((e) => { return e && (/^[a-zA-Z0-9\-.]+$/).test(e); })
      .length;
    const valid = (numValidHashes === 2);
    const buildName = (() => {
      switch (name) {
        case 'dev':
        case 'beta':
        case 'e2e':
        case 'qa':
          return name;
        default:
          return null;
      }
    })();
    const info = [];
    if (valid) {
      info.push({ title: 'Branch', value: gitbranch });
      info.push({ title: 'Commit', value: gitcommit.slice(0, 10) });
    }
    if (buildName) {
      info.push({ title: 'Build', value: buildName });
    }

    return (
      <div className="buildinfo">
        { info.map(({ title, value }) => {
          return (
            <div key={title.toLowerCase()}>
              <div className="title">
                { title }
              </div>
              <span>
                { value }
              </span>
            </div>
          );
        }) }
      </div>
    );
  }

  render() {
    const { context: { theme } } = this.props;
    const BuildInfo = this.buildInfo;

    return (
      <div id="extra-features-page" className="row">
        <div className={`top-border ${theme}`} id="extra-features">
          <PageTitle text={t('ChangeExtraFeaturesSettings')} />

          <ExtraFeaturesSection
            changeTheme={this.changeTheme}
            onDebugClick={this.onDebugClick}
          />

          <div className={`panelfooter ${theme}`}>
            <div>
              v
              { this.buildinfo.version }
              &nbsp;
              (
              <a href="#changelog" onClick={this.viewChangeLog}>
                { t('ViewChangelog') }
              </a>
              )
              <BuildInfo />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ExtraFeaturesPage.propTypes = {
  context: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withAppContext(ExtraFeaturesPage));
