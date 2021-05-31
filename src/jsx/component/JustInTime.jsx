import PropTypes from "prop-types";
import withAppContext from "@hoc/withAppContext";
import React, { Component } from "react";
import StarIconEmpty from "@material-ui/icons/StarOutlined";
import StarIconFilled from "@material-ui/icons/Star";
import http from "@helpers/http";
const SETTINGS_DISCLAIMER_KEY = "app::justInTimeDismissed";

class JustInTime extends Component {
  constructor(props) {
    super(props);
    this.app = props.context.app;
    this.storage = this.app.util.storage;
    this.buildinfo = this.app.buildinfo;
    this.platforminfo = this.app.util.platforminfo;
    this.user = this.app.util.user;
    this.i18n = this.app.util.i18n;
    this.state = {
      currentIndex: null,
      afterReview: null,
    };
  }

  onMouseEnterHandler(k) {
    this.setState({ currentIndex: k });
  }

  sendStars(index) {
    const ACCOUNT_ENDPOINT =
      "https://www.privateinternetaccess.com/api/client/v2/rating";
    const authToken = this.user.getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${authToken}`,
    };
    const body = JSON.stringify({
      application: "chrome-extension",
      platform: this.platforminfo.os,
      rating: 1,
      version: this.buildinfo.version,
    });
    const options = { headers, body, timeout: 5000 };
    http
      .post(ACCOUNT_ENDPOINT, options)
      .then((res) => {
        debug("Rating is here ", res.json());
        return res.json();
      })
      .catch((err) => {
        debug(`Something went wrong , ${err.cause}`);
      });

    this.changeMessage(index);
    this.storage.setItem(SETTINGS_DISCLAIMER_KEY, false);
  }

  openAccount(url) {
    chrome.tabs.create({ url: url });
  }

  changeMessage(index) {
    const { theme } = this.props;
    const lang = this.i18n.locale ? this.i18n.locale : "en";
    if (index < 4) {
      if (typeof browser == "undefined") {
        this.setState({
          afterReview: (
            <div className={`response-message ${theme} ${lang}`}>
              {t("encounterMessage_1")}
              <a
                href="#"
                onClick={() => {
                  this.openAccount(
                    "https://www.privateinternetaccess.com/helpdesk/"
                  );
                }}
              >
                {t("encounterMessage_2")}
              </a>
              .
            </div>
          ),
        });
      } else {
        this.setState({
          afterReview: (
            <div className={`response-message ${theme} ${lang}`}>
              {t("encounterMessageFirefox_1")}
              <a
                href="#"
                onClick={() => {
                  this.openAccount(
                    "https://www.privateinternetaccess.com/helpdesk/"
                  );
                }}
              >
                {t("encounterMessageFirefox_2")}
              </a>
              .
            </div>
          ),
        });
      }
    } else {
      if (typeof browser == "undefined") {
        this.setState({
          afterReview: (
            <div className={`response-message ${theme} ${lang}`}>
              {t("feedbackMessage_1")}
              <a
                href="#"
                onClick={() => {
                  this.openAccount(
                    "https://chrome.google.com/webstore/detail/private-internet-access/jplnlifepflhkbkgonidnobkakhmpnmh"
                  );
                }}
              >
                {t("feedbackMessage_2")}
              </a>
              .
            </div>
          ),
        });
      } else {
        this.setState({
          afterReview: (
            <div className={`response-message ${theme} ${lang}`}>
              {t("feedbackMessageFirefox_1")}
              <a
                href="#"
                onClick={() => {
                  this.openAccount(
                    "https://addons.mozilla.org/en-US/firefox/addon/private-internet-access-ext/"
                  );
                }}
              >
                {t("feedbackMessageFirefox_2")}
              </a>
              .
            </div>
          ),
        });
      }
    }
  }

  renderStars(index) {
    const { currentIndex } = this.state;
    const { theme } = this.props;
    let startTheme = "#889099";
    if (theme == "dark") {
      startTheme = "#323642";
    }
    let stars = (
      <StarIconEmpty
        key={index}
        className="stars"
        onMouseLeave={() => {
          this.setState({ currentIndex: null });
        }}
        onMouseEnter={() => {
          this.onMouseEnterHandler(index);
        }}
        style={{ fill: startTheme, fontSize: 40 }}
        onClick={() => {
          this.sendStars(index);
        }}
      />
    );

    if (currentIndex && currentIndex >= index) {
      stars = (
        <StarIconFilled
         key={index}
          className="stars"
          onClick={() => {
            this.sendStars(index);
          }}
          onMouseLeave={() => {
            this.setState({ currentIndex: null });
          }}
          onMouseEnter={() => {
            this.onMouseEnterHandler(index);
          }}
          style={{ fill: "#5DDF5A", fontSize: 40 }}
        />
      );
    }
    return stars;
  }

  render() {
    const { onDismiss, theme } = this.props;
    const { afterReview } = this.state;
    const lang = this.i18n.locale ? this.i18n.locale : "en";

    return (
      <div>
        <div className={`just-in-time tile ${theme}`}>
          {!afterReview ? (
            <div className={`just-in-time-contents ${lang}`}>
              {t("JustInTimeDisclaimer")}
            </div>
          ) : (
            <div></div>
          )}
          {!afterReview ? (
            <div className="just-in-time-start">
              {[1, 2, 3, 4, 5].map((v) => {
                return this.renderStars(v);
              })}
            </div>
          ) : (
            afterReview
          )}
          <div
            className="just-in-time-dismiss"
            onClick={onDismiss.bind(this, "settings")}
            role="button"
          />
        </div>
      </div>
    );
  }
}

JustInTime.propTypes = {
  onDismiss: PropTypes.func,
};

export default withAppContext(JustInTime);
