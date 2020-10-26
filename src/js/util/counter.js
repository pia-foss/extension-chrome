class Counter {
  constructor(app) {
    // bindings
    this.get = this.get.bind(this);
    this.inc = this.inc.bind(this);
    this.del = this.del.bind(this);

    // init
    this.app = app;
    this.table = {};
  }

  get(member) {
    return this.table[member] || 0;
  }

  inc(member) {
    this.table[member] = (this.table[member] || 0) + 1;
  }

  del(member) {
    delete this.table[member];
  }
}

export default Counter;
