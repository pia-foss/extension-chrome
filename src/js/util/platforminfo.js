class PlatformInfo {
  constructor(app) {
    // bindings
    this.isWindows = this.isWindows.bind(this);
    this.lineEnding = this.lineEnding.bind(this);
    this.init = this.init.bind(this);

    // init
    this.app = app;
    this.os = undefined;
    this.arch = undefined;
    this.naclArch = undefined;
    this.ready = false;
    this.initializing = this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line camelcase
      chrome.runtime.getPlatformInfo(({ os, arch, nacl_arch }) => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); }
        else {
          this.os = os;
          this.arch = arch;
          // eslint-disable-next-line camelcase
          this.naclArch = nacl_arch;
          this.ready = true;
          resolve();
        }
      });
    });
  }

  isWindows() {
    return this.os === 'win';
  }

  lineEnding() {
    return this.isWindows() ? '\r\n' : '\n';
  }
}

export default PlatformInfo;
