import http from '../helpers/http';
import ChromeSetting from '@firefoxsettings/chromesetting';
import { Target, Type, sendMessage } from '@helpers/messagingFirefox';
const pacengine = require('../pacengine');

class Proxy {
  constructor(app, foreground) {
    
    const handleProxyRequest = (requestInfo) => {
      
      const { origin } = new URL(requestInfo.url)

      const key = app.util.regionlist.getPort();

      const region = app.util.regionlist.getSelectedRegion();
      if ( !region ) return
      
      if (app.util.bypasslist.toArray().includes(origin))
        return { type: 'direct' };
      //smart location proxy rule check

      const proxyRule = this.changeProxyRule(this.getUserRules(requestInfo.url));
      
      if(proxyRule){
        return proxyRule;
      }

      return { host:region.host, port: region[key], type: region.scheme };
    };
    
    browser.proxy.onError.addListener((error) => {
      debug(`Proxy error: ${error.message}`);
    });
    
    this.enabled = () => {
      return browser.proxy.onRequest.hasListener(handleProxyRequest);
    };

    this.getEnabled = () =>{
        return browser.proxy.onRequest.hasListener(handleProxyRequest);
    }
    
    this.enable = async () => {
      if(this.enabled()) return
      app.util.icon.online();
      app.util.storage.setItem('online', String(true));
      browser.proxy.onRequest.removeListener(handleProxyRequest);
      browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ['<all_urls>'] });
      http.head('https://privateinternetaccess.com');
      sendMessage(Target.ALL, Type.PROXY_ENABLE);
      const { util: { ipManager,settingsmanager } } = app;
      ipManager.update({ retry: true });
      settingsmanager.clearAndReapplySettings('alwaysActive'); 
      return this;
    };
    
    this.disable = async () => {
      // if(!this.enabled()) return
      app.util.icon.offline();
      app.util.storage.setItem('online', String(false));
      browser.proxy.onRequest.removeListener(handleProxyRequest);
      sendMessage(Target.ALL, Type.PROXY_DISABLE);
      const { util: { ipManager,settingsmanager } } = app;
      ipManager.update({ retry: false })
      settingsmanager.clearAndReapplySettings('alwaysActive');
      return this;
    };

    this.userRulesProxy = null;
  }

  
  getUserRules(tab){
    //get parse url and get smart proxy rule
    const { util: { icon },helpers } = app;
    const parseUrl =  helpers.UrlParser.parse(tab);
    return icon.getCurrentState(tab, parseUrl);
  }
  
 changeProxyRule (tab){
    const { util: { smartlocation,regionlist } } = app;
    const locations =  Object.values(regionlist.getRegions());

    const key = app.util.regionlist.getPort();
    if(smartlocation.getSmartLocationRules('smartLocationRules').length > 0 && smartlocation.getSmartLocationRules('checkSmartLocation')){
      // nodeDict is used for PAC script
      const nodeDict = pacengine.getNodeDictFromLocations(
        locations,
        key,
        [],
        true
      );
      if(nodeDict[tab.customCountry]){
        //smart proxy rule
        const dnsname = nodeDict[tab.customCountry]
        const [host, port] = dnsname.split(':');
        return {
          type:'https',
          host,
          port: Number(port) || 443
        }    
       
      }else{
        return null;
      }
    }else{
      return null;
    }
    
  }
  
  
  isControllable (){ return true }
  getLevelOfControl () { return ChromeSetting.controlled }
  setLevelOfControl () { }
  
  static debug(msg, err) {
    return ChromeSetting.debug('proxy', msg, err);
  }
}

export default Proxy;
