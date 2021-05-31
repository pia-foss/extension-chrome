const greenRobots = {
  16: '/images/icons/icon16.png',
  32: '/images/icons/icon32.png',
  48: '/images/icons/icon48.png',
  64: '/images/icons/icon64.png',
  128: '/images/icons/icon128.png',
};

const redRobots = {
  16: '/images/icons/icon16red.png',
  32: '/images/icons/icon32red.png',
  48: '/images/icons/icon48red.png',
  64: '/images/icons/icon64red.png',
  128: '/images/icons/icon128red.png',
};

const pacengine = require('../pacengine');
// const urlParser = require('../pacengine/url-parser');
/**
 * Control the icon used to open the foreground
 *
 * Should show green icon w/ flag when connected, or
 * red icon w/o flag when disconnected
 */
class Icon {
  constructor(app) {
    // bindings
    this.online = this.online.bind(this);
    this.offline = this.offline.bind(this);
    this.updateTooltip = this.updateTooltip.bind(this);
    // init
    this.app = app;
  }

  getCurrentState(url, parseUrl) {
    const userRulesSmartLoc = this.app.util.smartlocation.getSmartLocationRules('smartLocationRules').map(loc =>{
      return {cc:loc.proxy.id,domain:loc.userRules,country:loc}
    })
    const rules = typeof browser == 'undefined' ? this.app.proxy.rules : userRulesSmartLoc;
    const state = pacengine.getProxyStateByURL(url, parseUrl.host, rules);
    // Add booleans indicating the state of a tab.
    const tabState = {
      isDefault: state === 'DEFAULT', // Only occurs if no rule did match
      isLocal: state === 'LOCAL', // Only true on local sites (including config.localDomains)
      isDirect: state === 'OFF',
      isRuleActive: false,
      customCountry: null
    };
    tabState.isRuleActive = !(tabState.isDefault || tabState.isLocal);
    // If a rule matches add the country code, make clear it's not a full location by variable naming.
    if (tabState.isRuleActive && !tabState.isDirect) {
      tabState.customCountry = state;
    }
    return tabState;
  }

  async upatedOnChangeTab(tabId){
    //check if there are rules
    const checkSmartLoc = this.app.util.smartlocation.getSmartLocationRules('checkSmartLocation');
    chrome.tabs.get(tabId, (tab) => {
      this.app.util.smartlocation.setCurrentDomain();
      this.app.util.regionlist.selectedRegionSmartLoc = null;
      this.online(null);
      if(tab.url){
        //get the parsed url
        const parseUrl =  this.app.helpers.UrlParser.parse(tab.url);
        //get the state if there are rules
        const tabState = this.getCurrentState(tab.url, parseUrl);
        if(checkSmartLoc){
          this.app.util.ipManager.updateIpByRegion(tabState);
          //change icon
          this.getStateAndChangeIcon(tabState)
        }
      }
    })
  }

  getStateAndChangeIcon(tab){
    //change icon for location
    if(tab.customCountry){
      const location = this.app.util.regionlist.getRegionById(tab.customCountry);
      this.app.util.regionlist.selectedRegionSmartLoc = location;
      this.online(location);
    }
  }

  async online() {
    const regionSelected = this.app.util.regionlist.getSelectedRegion();  
    const imageData = {};
    const imagePromises = [];
    let region = regionSelected ? regionSelected : this.app.util.regionlist.getSelectedRegion();

    Object.keys(greenRobots).forEach((size) => {
      imagePromises.push(Icon.generateIcon(imageData, size, region));
    });

    Promise.all(imagePromises)
      .then(() => {
        if (region && this.app.proxy.enabled()) {
          chrome.browserAction.setIcon({ imageData });
          debug('icon.js: set icon online');
          this.updateTooltip();
        }
        else { debug('icon.js: ignore set icon online, not online'); }
      });
  }

  async offline() {
    const imageData = {};
    const imagePromises = [];

    Object.keys(greenRobots).forEach((size) => {
      imagePromises.push(Icon.generateErrorIcon(imageData, size));
    });

    Promise.all(imagePromises)
      .then(() => {
        if (!this.app.proxy.enabled()) {
          chrome.browserAction.setIcon({ imageData });
          debug('icon.js: set icon offline');
          this.updateTooltip();
        }
        else { debug('icon.js: ignore set icon offline, we\'re online'); }
      });
  }

  updateTooltip(regionIcon = null) {
    let title;
    const { proxy, buildinfo } = this.app;
    const { regionlist, user } = this.app.util;
    const region = regionIcon ? regionIcon : regionlist.getSelectedRegion();

    if (region && proxy.enabled()) {
      title = t('YouAreConnectedTo');
    }
    else {
      title = user.getLoggedIn() ? t('YouAreNotConnected') : 'Private Internet Access';
    }

    // Badge
    chrome.browserAction.setTitle({ title });
    const badgeInfo = (() => {
      switch (buildinfo.name) {
        case 'beta':
          return { text: buildinfo.name, color: '#FF0000' };
        case 'dev':
        case 'e2e':
        case 'qa':
          return { text: buildinfo.name, color: '#0198E1' };
        default:
          return null;
      }
    })();
    if (badgeInfo) {
      if (region && proxy.enabled()) {
        chrome.browserAction.setBadgeText({ text: '' });
      }
      else {
        const { text, color } = badgeInfo;
        chrome.browserAction.setBadgeText({ text });
        chrome.browserAction.setBadgeBackgroundColor({ color });
      }
    }
    debug(`icon.js: tooltip updated`);
  }

  static newCanvasCtx(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    return canvas.getContext('2d');
  }

  static newImage(imagePath) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imagePath;
      image.onload = () => { return resolve(image); };
      image.onerror = reject;
    });
  }

  static drawImage(ctx, image, x = 0, y = 0) {
    ctx.drawImage(image, x, y, image.width, image.height);
    return ctx;
  }

  static drawBorder(ctx, map) {
    const {
      width,
      height,
      color,
      lineWidth,
    } = map;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(0, 0, width, height);
  }

  static drawFlagOnto(ctx, flag) {
    const fctx = Icon.drawImage(Icon.newCanvasCtx(flag), flag);
    Icon.drawBorder(fctx, {
      lineWidth: 1,
      height: flag.height,
      width: flag.width,
      color: '#000000',
    });
    const image = fctx.getImageData(0, 0, flag.width, flag.height);
    ctx.putImageData(image, 0, flag.width - (flag.width * (9 / 16)));
  }

  static getFlagPath(regionISO, size) {
    return `/images/flags/${regionISO}_icon_${size}.png`;
  }

  static getFlagUrl(regionISO, size) {
    return `https://www.privateinternetaccess.com/images/flags/icons/${regionISO}_icon_${size}px.png`;
  }

  static async generateIcon(imageData, size, region) {
    let flag = null;
    const images = imageData;
    const robot = await Icon.newImage(greenRobots[size]);
    const ctx = Icon.drawImage(Icon.newCanvasCtx(robot), robot);
    try { flag = await Icon.newImage(Icon.getFlagPath(region.iso, size)); }
    catch (e) {
      try { flag = await Icon.newImage(Icon.getFlagUrl(region.iso, size)); }
      catch (err) { debug(`icon.js: flag icon failed`); }
    }
    if (flag) { Icon.drawFlagOnto(ctx, flag); }
    images[size] = ctx.getImageData(0, 0, robot.width, robot.height);
  }

  static async generateErrorIcon(imageData, size) {
    const images = imageData;
    const redrobot = await Icon.newImage(redRobots[size]);
    const ctx = Icon.drawImage(Icon.newCanvasCtx(redrobot), redrobot);
    images[size] = ctx.getImageData(0, 0, redrobot.width, redrobot.height);
  }
}

export default Icon;
