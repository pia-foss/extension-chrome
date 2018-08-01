/*
  interface SectionInfo {
    settingInfos: SettingInfo[];
    name: string;
    label: string;
  }

  type SettingInfo = RealSettingInfo | Builder;

  interface RealSettingInfo {
    settingID: string;
    label: string;
    tooltip: string;
    learnMoreHref?: string;
    learnMore?: string;
    warning?: string;
    controllable?: boolean;
    disabledValue?: boolean;
  }

  interface Builder {
    builder: () => JSX.Element;
    key: string;
  }
*/

/* Derived State */

/**
 * Add derived information to the base SectionInfo[] state
 *
 * @param {SectionInfo[]} sectionInfos Information about sections
 * @param {*} injected Required utilities
 *
 * @returns {SectionInfo[]} sectionInfo with derived state added
 */
const addDerivedInfo = (sectionInfos, {settings}) => {
  return sectionInfos.map((section) => {
    const newSection = Object.assign({}, section);
    newSection.settingInfos = newSection.settingInfos
      .map((info) => {
        // Builders are a way to inject other components in
        // and must be ignored (have no derived state)
        if (info.builder) {
          return info;
        }
        else {
          // Add value & controllable from settings
          const newInfo = Object.assign({}, info, {
            controllable: settings.getControllable(info.settingID),
            value: settings.getItem(info.settingID),
          });
          return newInfo;
        }
      });

    return newSection;
  });
};

/**
 * Get the total count, derived from settingInfos
 *
 * @param {SettingInfo[]} settingInfos Information for this section
 *
 * @returns {number} Total number of settings for this section
 */
const getTotalCount = (settingInfos) => {
  return settingInfos.filter((s) => !s.builder).length;
};

/**
 * Get the enabled count, derived from settingInfo
 *
 * @param {SettingInfo[]} settingInfos Information for this section
 *
 * @returns {number} Number of enabled settings for this section
 */
const getEnabledCount = (settingInfos) => {
  return settingInfos
    .filter((s) => !s.builder)
    .map((s) => s.controllable ? s.value : Boolean(s.disabledValue))
    .reduce((accum, value) => (accum + Number(value)), 0);
};

/**
 * Get whether or not a setting item should be checked
 *
 * @param {SettingInfo} settingInfo information about setting
 *
 * @returns {boolean} whether or not setting is checked
 */
const getChecked = ({ disabledValue, value, controllable }) => {
  if (controllable || typeof disabledValue === 'undefined') {
    return value;
  }
  else {
    return disabledValue;
  }
};

/*
  -- Adjusters --

  These modify a specific piece of the SectionInfo state, dictated by which
  updater function is used with it
*/

/**
 * Update a single settingInfo entry for a specific section
 *
 * @template T
 * @param {string} sectionName name of sections
 * @param {string} settingID id of setting
 * @param {function} settingInfoUpdater Transformation for settingInfo
 *
 * @returns {({sectionInfos}: {sectionInfos: SectionInfo[]}) => SectionInfo[]} Updater for sectionInfos state
 */
const createAdjustSectionSettingInfo = (sectionName, settingID, settingInfoUpdater) => ({sectionInfos}) => {
  const section = sectionInfos.find((sec) => sec.name === sectionName);
  if (!section) {
    throw new Error(debug(`sectionInfo.js: failed to find section with name ${sectionName}`));
  }

  const settingInfo = section.settingInfos
    .filter((info) => !info.builder)
    .find((info) => info.settingID === settingID);
  if (!settingInfo) {
    throw new Error(debug(`sectionInfo.js: failed to find settingInfo with id ${settingID} in section ${sectionName}`));
  }

  try {
    const updatedSettingInfo = settingInfoUpdater(settingInfo);

    const newSettingInfos = section.settingInfos.map((info) => info.settingID === settingID ? updatedSettingInfo : info);
    const newSection = Object.assign({}, section, {settingInfos: newSettingInfos});
    const newSectionInfos = sectionInfos.map((secInfo) => secInfo.name === sectionName ? newSection : secInfo);

    return {sectionInfos: newSectionInfos};
  }
  catch (err) {
    debug(`sectionInfo.js: Failed to update setting ${settingID} in section ${sectionName} with error:`);
    if (err.message) {
      debug(err.message);
    }
    else {
      debug(JSON.stringify(err));
    }

    throw err;
  }
};

/* SettingInfo Updaters */

/**
 * Update value of settingInfo, for use with {@link createAdjustSectionSettingInfo}
 *
 * @param {boolean} value new value for setting
 *
 * @returns {(settingInfo: SettingInfo) => SettingInfo} updated setting info
 */
const createValueUpdater = (value) => (settingInfo) => {
  return Object.assign(
    {},
    settingInfo,
    {value}
  );
};

/* Initial State */

/**
 * Create information necessary to build sections
 *
 * @param {*} browser Util to perform translations
 * @param {*} builders Builders used instead of a setting descriptor
 *
 * @returns {*} sections informations
 */
const createInitialSectionInfos = (
  {settings, browser, user},
  {debugSettingItemBuilder, languageDropdownBuilder}
) => {
  const baseInfo = [
    {
      label: t('Security'),
      name: 'security',
      settingInfos: [
        {
          settingID: 'blockadobeflash',
          label: t('BlockAdobeFlash'),
          tooltip: t('AdobeFlashTooltip', {browser})
        },
        {
          settingID: 'preventwebrtcleak',
          label: t("WebRTCLeakProtection"),
          tooltip: t("WebRTCTooltip", {browser}),
        }
      ],
    },
    {
      label: t('Privacy'),
      name: 'privacy',
      settingInfos: [
        {
          settingID: 'blockcamera',
          label: t('BlockCameraAccess'),
          tooltip: t('BlockCameraAccessTooltip'),
        },
        {
          settingID: 'blockmicrophone',
          label: t('BlockMicrophoneAccess'),
          tooltip: t('BlockMicrophoneAccessTooltip'),
        },
        {
          settingID: 'blocklocation',
          label: t('BlockLocationAccess'),
          tooltip: t('BlockLocationAccessTooltip'),
        },
        {
          settingID: 'blocknetworkprediction',
          label: t('BlockNetworkPrediction'),
          tooltip: t('BlockNetworkPredictionTooltip', {browser}),
        },
        {
          settingID: 'blocksafebrowsing',
          label: t('BlockSafeBrowsing'),
          tooltip: t('BlockSafeBrowsingTooltip', {browser}),
          learnMoreHref: 'https://en.wikipedia.org/wiki/Google_Safe_Browsing#Privacy',
          learnMore: t('ReadMore')
        },
        {
          settingID: 'blockautofill',
          label: t('BlockAutofill'),
          tooltip: t('BlockAutofillTooltip', {browser}),
        },
      ],
    },
    {
      label: t('Tracking'),
      name: 'tracking',
      settingInfos: [
        {
          settingID: 'blockthirdpartycookies',
          label: t('BlockThirdpartycookies'),
          tooltip: t('BlockThirdpartycookies', {browser})
        },
        {
          settingID: 'blockreferer',
          label: t('BlockHTTPReferer'),
          tooltip: t('BlockHTTPRefererTooltip', {browser}),
        },
        {
          settingID: 'blockhyperlinkaudit',
          label: t('BlockHyperLinkAuditing'),
          tooltip: t('BlockHyperLinkAuditingTooltip'),
        },
        {
          settingID: 'blockutm',
          label: t('BlockUTM'),
          tooltip: t('BlockUTMTooltip'),
        },
        {
          settingID: 'maceprotection',
          label: t('MaceProtection'),
          tooltip: t('MaceTooltip'),
          learnMore: t('WhatIsMace'),
          learnMoreHref: 'https://www.privateinternetaccess.com/helpdesk/kb/articles/what-is-mace',
        },
      ],
    },
    {
      label: t('Extension'),
      name: 'developer',
      settingInfos: [
        {
          settingID: 'allowExtensionNotifications',
          label: t('AllowExtensionNotifications'),
          tooltip: t('AllowExtensionNotificationsTooltip'),
        },
        {
          settingID: 'logoutOnClose',
          label: t('LogMeOutOnClose'),
          tooltip: t('LogMeOutOnCloseTooltip'),
          warning: t('LogMeOutOnCloseDisabled'),
          controllable: user.getRememberMe(),
          disabledValue: true,
        },
        {
          settingID: 'debugmode',
          label: t('DebugMode'),
          tooltip: t('DebugModeTooltip'),
        },
        {
          builder: debugSettingItemBuilder,
          key: 'debug-setting'
        },
        {
          builder: languageDropdownBuilder,
          key: 'language-dropdown'
        },
      ],
    },
  ];

  return addDerivedInfo(baseInfo, {settings});
};

export {
  createInitialSectionInfos,
  createAdjustSectionSettingInfo,
  createValueUpdater,
  getTotalCount,
  getEnabledCount,
  getChecked,
};
