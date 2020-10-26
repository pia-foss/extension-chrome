class BuildInfo {
  constructor() {
    this.name = process.env.BUILD_NAME;
    this.version = process.env.PIA_VERSION;
    this.date = new Date(process.env.BUILD_DATE);
    this.debug = process.env.NODE_ENV !== 'production';
    this.coupon = process.env.COUPON;
    this.gitcommit = process.env.COMMIT_HASH;
    this.gitbranch = process.env.GIT_BRANCH;
    this.browser = BuildInfo.getFormattedBrowser();
  }

  static getFormattedBrowser() {
    const browser = process.env.BROWSER_NAME;
    const [firstChar] = browser;
    const tail = browser.slice(1);
    return firstChar.toLocaleUpperCase() + tail;
  }
}

export default BuildInfo;
