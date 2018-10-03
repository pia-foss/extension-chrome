/*
  interface SectionData {
    name: string;
    label: string;
  }
*/

/**
 * Get the section name given key
 *
 * used to catch errors from invalid keys
 *
 * @param {string} key Section key
 * @returns {string} Section name
 * @throws {Error} Given invalid key
 */
function getSectionName(key) {
  switch (key) {
    case 'security': return 'security';
    case 'extension': return 'developer';
    case 'tracking': return 'tracking';
    case 'privacy': return 'privacy';
    default: throw new Error(`no such section for key: ${key}`);
  }
}

function createSectionsData({ t }) {
  return [
    {
      name: 'security',
      label: t('Security'),
    },
    {
      name: getSectionName('privacy'),
      label: t('Privacy'),
    },
    {
      name: getSectionName('tracking'),
      label: t('Tracking'),
    },
    {
      name: getSectionName('extension'),
      label: t('Extension'),
    },
  ];
}

function getSection(sectionKey, sectionData) {
  const sectionName = getSectionName(sectionKey);
  return sectionData.find((section) => {
    return section.name === sectionName;
  });
}

export {
  createSectionsData,
  getSectionName,
  getSection,
};
