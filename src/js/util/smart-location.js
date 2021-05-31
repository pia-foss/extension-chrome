export default class SmartLocation {
    constructor(app,foreground) {
      // Bindings
      this.app = app;
      this.init = this.init.bind(this);
      this.storage = app.util.storage;
      this.helpers = app.helpers
      this.regionlist = app.util.regionlist;
      this.proxy = app.proxy;
      this.adapter = app.adapter;
      this.foreground = foreground;
      this.userRules = null;
      this.checkSmartLocation = null;
      this.currentTabUrl = '';
      this.setCurrentDomain = this.setCurrentDomain.bind(this);
      this.visibleSize = this.visibleSize.bind(this);
      this.removeSmartLocation = this.removeSmartLocation.bind(this);
      this.getSmartLocationRules = this.getSmartLocationRules.bind(this);
    }
    init(){
        try{
        //init userrules array and smartlocation check
        if(!this.storage.getItem('smartLocationRules')){
            this.storage.setItem("smartLocationRules", JSON.stringify([]));
            this.storage.setItem("checkSmartLocation",false)
        }
        const smartLocationRules = this.storage.getItem('smartLocationRules');
        if(typeof smartLocationRules != 'string'){
            this.storage.setItem("smartLocationRules", JSON.stringify(smartLocationRules));
        }
        this.userRules = typeof smartLocationRules == 'string' ? JSON.parse(smartLocationRules) : smartLocationRules;
        this.checkSmartLocation =  this.storage.getItem('checkSmartLocation');
        }catch(err){
            this.storage.setItem("smartLocationRules", JSON.stringify([]));
            this.storage.setItem("checkSmartLocation",false);
            debug(err);
        }
    }

    visibleSize() {
        return JSON.parse(this.storage.getItem('smartLocationRules')).length;
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
        let usersRules = JSON.parse(this.storage.getItem('smartLocationRules')) ? JSON.parse(this.storage.getItem('smartLocationRules')) : [];
        const smartRule = {userRules,userSelect,proxy: Object.values(regionList).filter(v=> v.id == userSelect)[0]};
        if(smartRule.proxy){
            usersRules.push(smartRule);
            this.saveToStorage("smartLocationRules", usersRules);
        }
    }

    removeSmartLocation(rule){
        //remove smart location
        let usersRules = JSON.parse(this.storage.getItem('smartLocationRules')) ? JSON.parse(this.storage.getItem('smartLocationRules')) : [];
        usersRules = usersRules.filter(v=>v.userRules != rule.userRules );

        this.saveToStorage("smartLocationRules", usersRules);
        if(typeof browser == 'undefined'){
            this.app.proxy.filterByRemovedLocation(rule);
        }
    }

    editSmartLocation(rule){
        const regionList = this.regionlist.getRegions();
        const userRules = JSON.parse(this.storage.getItem('smartLocationRules'));
        rule.proxy =  Object.values(regionList).filter(v=> v.id == rule.userSelect)[0];
        if(rule.proxy){
            userRules.splice(rule.indexEdit, 1, rule);
            delete rule.indexEdit;
            this.saveToStorage("smartLocationRules", userRules);

        }
    }

    getSmartLocationRules(value){
        
        const userRules = typeof this.storage.getItem(value) == 'string' ? JSON.parse(this.storage.getItem(value)) : this.storage.getItem(value);
        return userRules;
    }

    saveToStorage(key,value){
        if (this.foreground && typeof browser != 'undefined') {
            this.adapter.sendMessage('smartLocation', { settingID:key, value: value });
          }
        return this.storage.setItem(key, JSON.stringify(value));
    }
 
}