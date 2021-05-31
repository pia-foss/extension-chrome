/*
  Utilities for sending/receiving messages within the PIA application

  @type Listener <T> = (payload: T) => void;
*/

const Target = {
    ALL: '@all',
    POPUPS: '@popups',
    FOREGROUND: '@foreground',
    BACKGROUND: '@background'
  };
  
  const Namespace = {
    REGIONLIST: 'util.regionlist',
    PROXY: 'proxy',
    BYPASSLIST: 'util.bypasslist',
    I18N: 'util.i18n',
  };
  
  const Type = {
    FOREGROUND_OPEN: 'foreground_open',
    UPDATE_PAC_INFO: 'update_pac_info',
    DEBUG: 'debug',
    SET_SELECTED_REGION: `${Namespace.REGIONLIST}.setSelectedRegion`,
    IMPORT_REGIONS: `${Namespace.REGIONLIST}.import`,
    IMPORT_AUTO_REGION: `${Namespace.REGIONLIST}.setAutoRegion`,
    SET_FAVORITE_REGION: `${Namespace.REGIONLIST}.setFavoriteRegion`,
    ADD_OVERRIDE_REGION: `${Namespace.REGIONLIST}.addOverrideRegion`,
    REMOVE_OVERRIDE_REGION: `${Namespace.REGIONLIST}.removeOverrideRegion`,
    PROXY_ENABLE: `${Namespace.PROXY}.enable`,
    PROXY_DISABLE: `${Namespace.PROXY}.disable`,
    PAC_UPDATE: `${Target.PAC}/update`,
    DOWNLOAD_BYPASS_JSON: `${Namespace.BYPASSLIST}.saveRulesToFile`,
    IMPORT_RULES: `${Namespace.BYPASSLIST}.importRules`,
    I18N_TRANSLATE: `${Namespace.I18N}.t`,
  };
  
  async function sendMessage(target, type, data) {
    if (!Object.values(Target).includes(target)) {
      throw new Error(`invalid target: ${target}`);
    }
    if (!type) {
      throw new Error('invalid type');
    } 
    const msg = {
      type,
      target,
      data: data || {},
    };
  
    return browser.runtime.sendMessage(msg);
  }
  
  function isTarget(message, target) {
    if (!message) { return false; }
    if (!message.target) { return false; }
    if (message.target !== target && message.target !== Target.ALL) { return false; }
  
    return true;
  }
  
  function isType(message, type) {
    if (!message) { return false; }
    if (!message.type) { return false; }
    if (!message.type === type) { return false; }
  
    return true;
  }
  
  export {
    Target,
    Type,
    Namespace,
    sendMessage,
    isTarget,
    isType,
  };
  