import { getSectionName } from './sections';

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
function createSettingsData({
  t,
  settings,
  browser,
  user,
}) {
  const data = [
    {
      settingID: 'blockadobeflash',
      section: getSectionName('security'),
      label: t('BlockAdobeFlash'),
      tooltip: t('AdobeFlashTooltip', { browser }),
    },
    {
      settingID: 'preventwebrtcleak',
      section: getSectionName('security'),
      label: t('WebRTCLeakProtection'),
      tooltip: t('WebRTCTooltip', { browser }),
    },
    {
      settingID: 'blockcamera',
      section: getSectionName('privacy'),
      label: t('BlockCameraAccess'),
      tooltip: t('BlockCameraAccessTooltip'),
    },
    {
      settingID: 'blockmicrophone',
      section: getSectionName('privacy'),
      label: t('BlockMicrophoneAccess'),
      tooltip: t('BlockMicrophoneAccessTooltip'),
    },
    {
      settingID: 'blocklocation',
      section: getSectionName('privacy'),
      label: t('BlockLocationAccess'),
      tooltip: t('BlockLocationAccessTooltip'),
    },
    {
      settingID: 'blocknetworkprediction',
      section: getSectionName('privacy'),
      label: t('BlockNetworkPrediction'),
      tooltip: t('BlockNetworkPredictionTooltip', { browser }),
    },
    {
      settingID: 'blocksafebrowsing',
      section: getSectionName('privacy'),
      label: t('BlockSafeBrowsing'),
      tooltip: t('BlockSafeBrowsingTooltip', { browser }),
      learnMoreHref: 'https://en.wikipedia.org/wiki/Google_Safe_Browsing#Privacy',
      learnMore: t('ReadMore'),
    },
    {
      settingID: 'blockautofill',
      section: getSectionName('privacy'),
      label: t('BlockAutofill'),
      tooltip: t('BlockAutofillTooltip', { browser }),
    },
    {
      settingID: 'blockthirdpartycookies',
      section: getSectionName('tracking'),
      label: t('BlockThirdpartycookies'),
      tooltip: t('BlockThirdpartycookies', { browser }),
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
      settingID: 'maceprotection',
      section: getSectionName('tracking'),
      label: t('MaceProtection'),
      tooltip: t('MaceTooltip'),
      learnMore: t('WhatIsMace'),
      learnMoreHref: 'https://www.privateinternetaccess.com/helpdesk/kb/articles/what-is-mace',
    },
    {
      settingID: 'allowExtensionNotifications',
      section: getSectionName('extension'),
      label: t('AllowExtensionNotifications'),
      tooltip: t('AllowExtensionNotificationsTooltip'),
    },
    {
      settingID: 'logoutOnClose',
      section: getSectionName('extension'),
      label: t('LogMeOutOnClose'),
      tooltip: t('LogMeOutOnCloseTooltip'),
      warning: t('LogMeOutOnCloseDisabled'),
      controllable: user.getRememberMe(),
      disabledValue: true,
    },
    {
      settingID: 'debugmode',
      section: getSectionName('extension'),
      label: t('DebugMode'),
      tooltip: t('DebugModeTooltip'),
    },
  ];

  return data.map((setting) => {
    return Object.assign({}, setting, {
      controllable: settings.getControllable(setting.settingID),
      value: settings.getItem(setting.settingID),
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
