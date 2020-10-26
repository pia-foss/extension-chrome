class ErrorInfo {
  constructor(app) {
    // bindings
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.delete = this.delete.bind(this);

    // init
    this.app = app;
    this.errorMap = new Map();
  }

  set(errorName, url) {
    const errorID = ErrorInfo.generateID();
    this.errorMap.set(errorID, [errorName, url]);
    return errorID;
  }

  get(errorID) {
    return this.errorMap.get(errorID) || [];
  }

  delete(errorID) {
    const deleted = this.errorMap.delete(errorID);
    if (deleted) {
      debug(`errorinfo.js: delete ${errorID}`);
    }
    else {
      debug(`errorinfo.js: miss ${errorID}`);
    }
    return deleted;
  }

  static generateID() {
    let errorID = '';
    for (let i = 0; i < 3; i++) {
      errorID += Math.random().toString(36);
    }
    return errorID;
  }
}

export default ErrorInfo;
