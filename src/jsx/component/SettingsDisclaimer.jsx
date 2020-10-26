import React from "react";
import PropTypes from "prop-types";

const SettingsDisclaimer = ({ onDismiss, theme, whichDisclaimer }) => {
  return (
    <div>
      {whichDisclaimer == "settingDisclaimer" ? (
        <div className={`settings-disclaimer tile ${theme}`}>
          <span className="disclaimer-contents">
            {t("PersistentSettingsDisclaimer")}
          </span>
          <div
            className="disclaimer-dismiss"
            onClick={onDismiss.bind(this, "settings")}
            role="button"
          />
        </div>
      ) : (
        <div className={`settings-disclaimer tile ${theme}`}>
          <span className="disclaimer-contents">
            {t("PersistentIncognitoDisclaimer")}
          </span>
          <div
            className="disclaimer-dismiss"
            onClick={onDismiss.bind(this, "incognito")}
            role="button"
          />
        </div>
      )}
    </div>
  );
};

SettingsDisclaimer.propTypes = {
  onDismiss: PropTypes.func,
};

export default SettingsDisclaimer;
