const { print } = require('../util');

class ReporterPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.done.tap('ReporterPlugin', () => {
      print('Compilation: completed successfully');
    });
  }
}

module.exports = ReporterPlugin;
