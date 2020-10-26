const { execSync } = require('child_process');
const { AsyncParallelHook } = require('tapable');
const { join } = require('path');

const {
  dist,
  print,
  Color,
  formatFilename,
} = require('../util');

class ZipPlugin {
  constructor(...opts) {
    this.opts = opts;
  }

  apply(compiler) {
    this.opts.forEach((opt) => {
      if (opt.hook) {
        if (compiler.hooks[opt.hook]) {
          throw new Error(`ZipPlugin: ${opt.hook} hook already in use`);
        }
        // eslint-disable-next-line no-param-reassign
        compiler.hooks[opt.hook] = new AsyncParallelHook(['zippedDir', 'zippedFilename']);
      }
    });
    compiler.hooks.done.tapPromise('ZipPlugin', async () => {
      try {
        this.opts
          .map((opt) => {
            if (!opt.source) {
              throw new Error('ZipPlugin opt requires source');
            }
            if (!opt.filename) {
              throw new Error('ZipPlugin opt requires filename');
            }
            const { source } = opt;
            const filename = formatFilename(opt.filename);
            const dir = opt.dir || dist('..');
            ZipPlugin.zip(source, join(dir, filename));
            print(`ZipPlugin: created zip ${filename}`);
            return {
              hook: opt.hook,
              filename,
              dir,
            };
          })
          .filter((info) => { return info.hook; })
          .forEach((info) => {
            return compiler.hooks[info.hook].promise(info.dir, info.filename);
          });
        print('ZipPlugin: completed successfully');
      }
      catch (err) {
        print('ZipPlugin: failed with error', Color.red);
        print(err.message || err, Color.red);
      }
    });
  }

  static zip(sourcePath, outputPath) {
    if (process.platform === 'win32') {
      const cmd = `Compress-Archive ./* ${outputPath}`;
      execSync(cmd, { cwd: sourcePath });
    }
    else {
      const cmd = `zip -r ${outputPath} ./*`;
      // Set CWD to source path to avoid zipping all directories
      execSync(cmd, { cwd: sourcePath });
    }
  }
}

module.exports = ZipPlugin;
