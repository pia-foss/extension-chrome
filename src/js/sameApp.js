class SameApp {
    constructor(app) {
        this.app = app;
        this.init = this.init.bind(this);
        this.storage = app.util.storage;
        this.returnBrowser = this.returnBrowser.bind(this);
        this.saveToStorage = this.saveToStorage.bind(this);
        this.adapter = app.adapter;
    }

    init() {
        if(typeof browser == "undefined"){
            this.saveToStorage("sameAppBrowser",'chrome');
        } else {
            this.saveToStorage("sameAppBrowser",'firefox');
        }
    }

    returnBrowser(){
        const browser = this.storage.getItem("sameAppBrowser");
        return browser;
    }

    saveToStorage(key,value,bridged){
        if (!bridged && typeof browser != 'undefined') {
            this.adapter.sendMessage('sameApp', { settingID:key, value: value });
        }
        return this.storage.setItem(key, value);
    }
}

export default SameApp;