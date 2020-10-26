

export default class SmartLocation {
    constructor(app) {
      // Bindings
      this.app = app;
      this.init = this.init.bind(this);
      this.storage = app.util.storage;
      this.helpers = app.helpers
      this.regionlist = app.util.regionlist;
      this.proxy = app.proxy;
      this.userRules = null;
      this.checkSmartLocation = null;
      this.currentTabUrl = '';
      this.setCurrentDomain = this.setCurrentDomain.bind(this);
      this.visibleSize = this.visibleSize.bind(this);
      this.removeSmartLocation = this.removeSmartLocation.bind(this);
    }
    init(){
        //init userrules array and smartlocation check
        if(!this.storage.getItem('smartLocationRules')){
            this.storage.setItem("smartLocationRules", []);
            this.storage.setItem("checkSmartLocation",false)
        }
        this.userRules = this.storage.getItem('smartLocationRules');
        this.checkSmartLocation =  this.storage.getItem('checkSmartLocation');
    }

    visibleSize() {
        return this.storage.getItem('smartLocationRules').length;
    }

    setCurrentDomain(){
        chrome.tabs.query({ currentWindow: true, active: true },  ([tab]) => {
            if(tab){
                const url = this.helpers.UrlParser.parse(tab.url) ? this.helpers.UrlParser.parse(tab.url) : '';
                this.currentTabUrl = (!tab.url.startsWith('chrome://')) ? url.domain : null;
            }
          });
    }
    
    addSmartLocation(userRules,userSelect){
        const regionList = this.regionlist.getRegions();
        //add smsart location
        let usersRules = this.storage.getItem('smartLocationRules') ? this.storage.getItem('smartLocationRules') : [];
        const smartRule = {userRules,userSelect,proxy: Object.values(regionList).filter(v=> v.id == userSelect)[0]};
        if(smartRule.proxy){
            usersRules.push(smartRule);
            this.storage.setItem("smartLocationRules", usersRules);
        }
    }

    removeSmartLocation(rule){
        //remove smart location
        let usersRules = this.storage.getItem('smartLocationRules') ? this.storage.getItem('smartLocationRules') : [];
        usersRules = usersRules.filter(v=>v.userRules != rule.userRules );
        this.storage.setItem("smartLocationRules", usersRules);
        this.app.proxy.filterByRemovedLocation(rule);
    }

    editSmartLocation(rule){
        const regionList = this.regionlist.getRegions();
        const userRules = this.storage.getItem('smartLocationRules');
        rule.proxy =  Object.values(regionList).filter(v=> v.id == rule.userSelect)[0];
        if(rule.proxy){
            userRules.splice(rule.indexEdit, 1, rule);
            delete rule.indexEdit;
            this.storage.setItem("smartLocationRules", userRules);
        }
    }

    getSmartLocationRules(value){
        return this.storage.getItem(value);
    }
 
}