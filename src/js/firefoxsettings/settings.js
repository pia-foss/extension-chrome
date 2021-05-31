import { getSectionName } from '@data/sections';

/**
  interface SettingData {
    sectionName: string;
    settingID: string;
    value: boolean;
    label: string;
    tooltip: string;
    learnMoreHref?: string;
    learnMore?: string;
    warning?: string;
    controllable?: boolean;
    disabledValue?: boolean;
  }
*/

/**
 * Get initial settings data
 *
 * @param {*} deps Dependencies to calculate settings data
 */
function createSettingsData({ t, settings, browser }) {
  const data = [
    {
      settingID: 'preventwebrtcleak',
      section: getSectionName('security'),
      label: t('WebRTCLeakProtection'),
      tooltip: t('WebRTCTooltip', { browser }),
    },
    {
      settingID: 'httpsUpgrade',
      section: getSectionName('security'),
      label: t('HttpsUpgrade'),
      tooltip: t('HttpsUpgradeTooltip'),
    },
    {
      settingID: 'blocknetworkprediction',
      section: getSectionName('privacy'),
      label: t('BlockNetworkPrediction'),
      tooltip: t('BlockNetworkPredictionTooltip', { browser }),
    },
    {
      settingID: 'trackingprotection',
      section: getSectionName('tracking'),
      label: t('TrackingProtection'),
      tooltip: t('TrackingProtectionTooltip'),
    },
    {
      settingID: 'fingerprintprotection',
      section: getSectionName('tracking'),
      label: t('FingerprintProtection'),
      tooltip: t('FingerprintProtectionTooltip', { browser }),
      learnMore: 'Mozilla Wiki - Security/Fingerprinting',
      learnMoreHref: 'https://wiki.mozilla.org/Security/Fingerprinting',
    },
    {
      settingID: 'blockreferer',
      section: getSectionName('tracking'),
      label: t('BlockHTTPReferer'),
      tooltip: t('BlockHTTPRefererTooltip', { browser }),
    },
    {
      settingID: 'blockhyperlinkaudit',
      section: getSectionName('tracking'),
      label: t('BlockHyperlinkAuditing'),
      tooltip: t('BlockHyperlinkAuditingTooltip'),
    },
    {
      settingID: 'blockutm',
      section: getSectionName('tracking'),
      label: t('BlockUTM'),
      tooltip: t('BlockUTMTooltip'),
    },
    {
      settingID: 'blockfbclid',
      section: getSectionName('tracking'),
      label: t('BlockFBCLID'),
      tooltip: t('BlockFBCLIDTooltip'),
    },
    {
      settingID: 'maceprotection',
      section: getSectionName('tracking'),
      label: t('MaceProtection'),
      tooltip: t('MaceTooltip'),
      learnMore: t('WhatIsMace'),
      learnMoreHref: 'https://www.privateinternetaccess.com/helpdesk/kb/articles/what-is-mace',
    },
    {
      settingID: 'darkTheme',
      section: getSectionName('extension'),
      label: t('DarkTheme'),
      tooltip: t('DarkThemeTooltip'),
    },
    {
      settingID: 'debugmode',
      section: getSectionName('extension'),
      label: t('DebugMode'),
      tooltip: t('DebugModeTooltip'),
    },
    {
      settingID: 'alwaysActive',
      section: getSectionName('extension'),
      label: t('AlwaysActive'),
      tooltip: t('AlwaysActiveTooltip'),
    },
  ];

  return data.map((setting) => {
    const controllable = settings.getControllable(setting.settingID);
    const available = settings.getAvailable(setting.settingID);
    const value = (available && controllable)
      ? settings.getItem(setting.settingID)
      : !!setting.disabledValue;
    return Object.assign({}, setting, {
      controllable,
      value,
      available,
    });
  });
}

/**
 * Get settings for a specific section
 *
 * @param {string} sectionKey Key for section
 * @param {*} settingsData Data for settings
 */
function getSectionSettings(sectionKey, settingsData) {
  const sectionName = getSectionName(sectionKey);
  return settingsData
    .filter((s) => { return s.available !== false; })
    .filter((setting) => {
      return setting.section === sectionName;
    });
}

/**
 * Get the number of enabled settings for a section
 *
 * @param {string} sectionKey Key for section
 * @param {*} settingsData Data for settings
 */
function getEnabledCount(sectionKey, settingsData) {
  return getSectionSettings(sectionKey, settingsData)
    .map((setting) => {
      return setting.value ? 1 : 0;
    })
    .reduce((a, b) => {
      return a + b;
    });
}

/**
 * Get the total number of settings in a section
 *
 * @param {string} sectionKey Key for section
 * @param {*} settingsData Data for settings
 */
function getTotalCount(sectionKey, settingsData) {
  return getSectionSettings(sectionKey, settingsData).length;
}

function getSetting(settingID, settingsData) {
  const setting = settingsData.find((settingData) => {
    return settingData.settingID === settingID;
  });
  if (!setting) {
    throw new Error(`no such setting with id: ${settingID}`);
  }

  return setting;
}

export {
  createSettingsData,
  getSetting,
  getEnabledCount,
  getTotalCount,
};
