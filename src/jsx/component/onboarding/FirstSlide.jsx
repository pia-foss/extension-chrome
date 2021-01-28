import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';

class FirstSlide extends Component {
  constructor(props) {
    super(props);
    // properties
    this.props = props;
  }

  render() {
    const {onclick} = this.props;
    const theme = this.props.context.getTheme();
    return (
        <div className={`first ${theme}`}>
          <div className="image-container">
            <img src="../../images/pia-robot.png" alt="" />
          </div>

          <div className="onboarding-section">
            <div className="onboarding-disclaimers">
              <p>{t("FirstSlideInstallThanks")}</p>
              <h3>{t("PrivateInternetAccess")}</h3>
              <h3>{t("BrowserMessage")}</h3>
            </div>
            <div className="onboarding-message">
              <p>{t("StartSlide")}</p>
            </div>
            <div className="onboarding-options-button">
              <button
                type="button"
                className="btn btn-success disable"
                onClick={() => {onclick(1)}}
              >
                {t("OnBoardingStart")}
              </button>
            </div>
          </div>
        </div>
    );
  }
}

export default withAppContext(FirstSlide);
