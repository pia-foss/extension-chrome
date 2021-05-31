import PropTypes from "prop-types";
import React, { Component } from "react";

import listenOnline from "@hoc/listenOnline";
import withAppContext from "@hoc/withAppContext";
import FirstSlide from "@component/onboarding/FirstSlide";
import SecondSlide from "@component/onboarding/SecondSlide";
import ThirdSlide from "@component/onboarding/ThirdSlide";

class OnboardingPage extends Component {
  constructor(props) {
    super(props);
    // Properties
    this.app = props.context.app;
    this.proxy = this.app.proxy;
    this.user = this.app.util.user;
    this.storage = this.app.util.storage;
    this.settings = this.app.util.settings;
    this.fingerprintProtectionSetting = "";
    this.fingerprintProtectionSettingId = "";
    this.i18n = this.app.util.i18n;
    this.sameApp = this.app.sameApp;

    // Bindings
    this.enable = this.enable.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.updateView = this.updateView.bind(this);
    this.skip = this.skip.bind(this);

    this.state = {
      indexSlide: 0,
      checkedArray: [true, false, false],
    };
  }

  enable() {
    // update the setting value in storage
    // this.settings.setItem(this.fingerprintProtectionSettingId, true);
    this.settings.setItem("firstRun", false);

    // Restart the proxy to apply the change in fingerprint protection settings
    let promise;
    const proxyOnline = this.storage.getItem("online") === "true";
    if (proxyOnline) {
      promise = this.proxy.enable();
    } else {
      promise = Promise.resolve();
    }

    // Redirect user to the correct view based on whether they are logged in
    return promise.then(() => {
      return this.updateView();
    });
  }

  nextSlide(slide) {
    this.setState({ indexSlide: slide });
  }

  updateView() {
    const {
      context: { updateFirstRun },
    } = this.props;
    return updateFirstRun();
  }

  skip(){
    const {
       updateFirstRun 
    } = this.props;
    this.settings.setItem("firstRun",false);
    return updateFirstRun();
  }

  checkSlides() {
    //Checks what index is checked and returs the right slide
    const { indexSlide, checkedArray } = this.state;

    if (indexSlide == 0) {
      return <FirstSlide onclick={this.nextSlide} />;
    }

    if (indexSlide == 1) {
      return <SecondSlide  />;
    }

    if (indexSlide == 2) {
      return <ThirdSlide />;
    }

    if(indexSlide == 3){
      this.skip();
    }
  }

  render() {
    let { indexSlide, checkedArray } = this.state;
    checkedArray= [false,false,false];
    const lang = this.i18n.locale ? this.i18n.locale : 'en';
    const browser = this.sameApp.returnBrowser();
    //store value true for where the index is
    checkedArray[indexSlide] = true;

    const theme = this.props.context.getTheme();

    return (
      <div className={`onboarding-page ${theme} ${lang} ${browser}`}>
        {/* Slides */}
        {this.checkSlides()}
        {/* Bullets and buttons (skip, next) */}
        <div className="bullets-skip">
          {checkedArray[1] || checkedArray[2] ? 
          <button type="button" className="btn-skip" onClick={this.skip}>
            <span>{t("Skip")}</span>
          </button>
          : null }
          <ul id="carousel">
            <li>
              <input
                type="radio"
                id="s3"
                name="num"
                checked={checkedArray[0]}
              />
              <label class="bullet" for="s3"></label>
            </li>
            <li>
              <input
                type="radio"
                id="s2"
                name="num"
                checked={checkedArray[1]}
              />
              <label class="bullet" for="s2"></label>
            </li>
            <li>
              <input
                type="radio"
                id="s1"
                name="num"
                checked={checkedArray[2]}
              />
              <label class="bullet" for="s1"></label>
            </li>
          </ul>
          {checkedArray[1] || checkedArray[2] ? 
          <button type="button" className="btn-next" onClick={()=>{this.nextSlide(indexSlide +  1)}}>
            <span>{t("Next")}</span>
          </button>
          : null }
        </div>
      </div>
    );
  }
}

OnboardingPage.propTypes = {
  online: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
};

export default withAppContext(listenOnline(OnboardingPage));
