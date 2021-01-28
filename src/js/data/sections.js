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

function createSectionsData({ t },defaultArray) {
  const sectionsArray = [
    {
      name: 'security',
      defaultOpen:false,
      label: t('Security'),
    },
    {
      name: getSectionName('privacy'),
      defaultOpen:false,
      label: t('Privacy'),
    },
    {
      name: getSectionName('tracking'),
      defaultOpen:false,
      label: t('Tracking'),
    },
    {
      name: getSectionName('extension'),
      defaultOpen:true,
      label: t('Extension'),
    }
  ]
    
  if(defaultArray){
    defaultArray.map((v,k) => {
      sectionsArray[k].defaultOpen = v;
    })
  }
  return sectionsArray;
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
