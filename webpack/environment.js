class Environment {
  constructor() {
    this.map = new Map();
  }

  set(key, value, stringify = true) {
    this.map.set(key, stringify ? JSON.stringify(value) : value);
    return this;
  }

  delete(key) {
    this.map.delete(key);
    return this;
  }

  export() {
    const arg = {};
    this.map.forEach((value, key) => {
      arg[`process.env.${key}`] = value;
    });
    return arg;
  }
}

module.exports = Environment;
