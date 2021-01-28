import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';
import OnboardingSettingsPage from '@pages/OnboardingSettingsPage';
class ThirdSlide extends Component {
  constructor(props) {
    super(props);
    // properties
    this.props = props;
    this.app = props.context.app;
    this.i18n = this.app.util.i18n;
  }

  render() {
    const theme = this.props.context.getTheme();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';


    return (
        <div className="third">
           <div className={`top-disclaimers ${theme} ${lang}`}>
                <p>{t("Step2")}</p>
                <h3>{t("EnableSetings")}</h3>
            </div>
            <div class='options'>
              <OnboardingSettingsPage />
            </div>
        </div>
    );
  }
}

export default withAppContext(ThirdSlide);
