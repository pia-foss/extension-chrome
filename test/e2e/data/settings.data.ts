interface SettingData {
  sectionName: string;
  settingName: string;
  settingID: string;
  expectedDefault: boolean;
}

function createData(): SettingData[] {
  return [
    {
      sectionName: 'privacy',
      settingName: 'blockCamera',
      settingID: 'blockcamera',
      expectedDefault: true,
    },
    {
      sectionName: 'privacy',
      settingName: 'blockMicrophone',
      settingID: 'blockmicrophone',
      expectedDefault: true,
    },
    {
      sectionName: 'privacy',
      settingName: 'blockLocation',
      settingID: 'blocklocation',
      expectedDefault: true,
    },
    {
      sectionName: 'privacy',
      settingName: 'disableNetworkPrediction',
      settingID: 'blocknetworkprediction',
      expectedDefault: true,
    },
    {
      sectionName: 'privacy',
      settingName: 'disableSafeBrowsing',
      settingID: 'blocksafebrowsing',
      expectedDefault: true,
    },
    {
      sectionName: 'privacy',
      settingName: 'disableAutofill',
      settingID: 'blockautofill',
      expectedDefault: true,
    },
    {
      sectionName: 'security',
      settingName: 'blockAdobeFlashCheckbox',
      settingID: 'blockadobeflash',
      expectedDefault: true,
    },
    {
      sectionName: 'security',
      settingName: 'preventWebRtcLeak',
      settingID: 'preventwebrtcleak',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'disableThirdPartyCookies',
      settingID: 'blockthirdpartycookies',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'disableWebsiteReferrer',
      settingID: 'blockreferer',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'disableHyperLinkAuditing',
      settingID: 'blockhyperlinkaudit',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'removeUtmParameters',
      settingID: 'blockutm',
      expectedDefault: true,
    },
    {
      sectionName: 'tracking',
      settingName: 'piaMace',
      settingID: 'maceprotection',
      expectedDefault: true,
    },
    {
      sectionName: 'extension',
      settingName: 'allowDesktopNotifications',
      settingID: 'allowExtensionNotifications',
      expectedDefault: true,
    },
    {
      sectionName: 'extension',
      settingName: 'logoutOnClose',
      settingID: 'logoutOnClose',
      expectedDefault: false,
    },
    {
      sectionName: 'extension',
      settingName: 'debugMode',
      settingID: 'debugmode',
      expectedDefault: false,
    },
  ];
}

export { createData, SettingData };
