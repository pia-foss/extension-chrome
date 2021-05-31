const path = require('path');
const { execSync } = require('child_process');
const { AsyncParallelHook } = require('tapable');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const {
  root,
  dist,
  print,
  Color,
  getExt,
  getBuild,
  getVersion,
  getBrowser,
  formatFilename,
  getBuildDirName,
  defaultFilename,
} = require('../util');

class PackPlugin {
  constructor(opts = {}) {
    this.browser = opts.browser || getBrowser();
    PackPlugin.validate(this.browser, opts);
    this.source = dist();
    this.dest = opts.dest || dist('..');
    this.build = opts.build || getBuild();
    this.platform = opts.platform || process.platform;
    this.useWebstoreKey = Boolean(opts.useWebstoreKey) || false;
    this.webstoreKey = opts.webstoreKey || '';
    this.version = opts.version || getVersion();
    this.filename = formatFilename(opts.filename)
      || defaultFilename();
    this.apiKey = opts.apiKey;
    this.apiSecret = opts.apiSecret;
    this.replaceDist = opts.replaceDist || false;
  }

  packCommand() {
    const {
      source,
      apiKey,
      browser,
      apiSecret,
      webstoreKey,
      useWebstoreKey,
    } = this;
    const { platform } = process;
    let command;
    switch (browser) {
      case 'opera': {
        command = PackPlugin.operaExe(platform);
        break;
      }
      case 'chrome': {
        command = PackPlugin.chromeExe(platform);
        break;
      }
      case 'firefox': {
        command = PackPlugin.firefoxExe(platform);
        break;
      }
      default: throw new Error(`unsupported browser: ${browser}`);
    }

    switch (browser) {
      case 'firefox': {
        command += ' sign';
        command += ` --api-key=${apiKey}`;
        command += ` --api-secret=${apiSecret}`;
        command += ` --source-dir=${source}`;
        command += ` --artifacts-dir=${dist('..')}`;
        command += `  --timeout=300000`;
        return command;
      }
      case 'chrome':
      case 'opera': {
        if (useWebstoreKey) {
          if (!webstoreKey) {
            throw new Error('missing webstore key');
          }
          command += ` --pack-extension-key=${webstoreKey}`;
        }
        command += ` --pack-extension=${source}`;

        return command;
      }
      default: throw new Error(`invalid browser: ${browser}`);
    }
  }

  async checkFileExists(filepath, limit) {
    const counter = limit;
    const exists = await fs.pathExists(filepath);
    if (exists) { return filepath; }

    if (counter <= 0) { throw new Error(`${filepath} Not Found.`); }

    return Promise.resolve().then(() => {
      return this.checkFileExists(filepath, counter - 1);
    });
  }

  getOutputPath() {
    const { dest, filename } = this;
    return path.join(dest, filename);
  }

  apply(compiler) {
    if (compiler.hooks.packed) {
      throw new Error('packed hook already in use');
    }
    // eslint-disable-next-line no-param-reassign
    compiler.hooks.packed = new AsyncParallelHook(['packedDir, packedFilename']);

    compiler.hooks.done.tapPromise('PackPlugin', async () => {
      try {
        const {
          dest,
          browser,
          filename,
        } = this;
        const command = this.packCommand();
        execSync(command);
        if (browser === 'chrome' || browser === 'opera') {
          await PackPlugin.remove(path.join(dest, `${getBuildDirName()}.pem`));
        }
        const defaultFilePath = PackPlugin.getDefaultFilePath(browser);
        const outputPath = this.getOutputPath();
        await this.checkFileExists(defaultFilePath, 3);
        if (this.replaceDist) {
          await PackPlugin.remove(outputPath);
        }
        fs.moveSync(defaultFilePath, outputPath);
        print('PackPlugin: completed successfully');
        compiler.hooks.packed.promise(dest, filename);
      }
      catch (err) {
        print('PackPlugin: failed with error', Color.red);
        print(err.message || err, Color.red);
        print('try packing via browser UI to debug', Color.red);
        process.exit(1);
      }
    });
  }

  static firefoxExe() {
    return root('node_modules', '.bin', 'web-ext');
  }

  static chromeExe(platform) {
    switch (platform) {
      case 'darwin': {
        return '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
      }
      case 'linux': {
        return 'chromium-browser';
      }
      case 'win32': {
        return 'start chrome';
      }
      default: throw new Error(`no exe for platform: ${platform}`);
    }
  }

  static operaExe(platform) {
    switch (platform) {
      case 'darwin': {
        return '/Applications/Opera.app/Contents/MacOS/Opera';
      }
      case 'linux': {
        return 'opera';
      }
      case 'win32': {
        return 'start opera';
      }
      default: throw new Error(`no exe for platform: ${platform}`);
    }
  }

  static getDefaultFilePath(browser) {
    const ext = getExt();
    let name;
    switch (browser) {
      case 'chrome':
      case 'opera': {
        name = getBuildDirName();
        break;
      }
      case 'firefox': {
        name = `private_internet_access-${getVersion()}-an+fx`;
        break;
      }
      default: throw new Error(`invalid browser: "${browser}"`);
    }
    return dist('..', `${name}.${ext}`);
  }

  static async remove(filepath) {
    return new Promise((resolve, reject) => {
      rimraf(filepath, (err) => {
        if (err) { reject(err); }
        else { resolve(); }
      });
    });
  }

  static validate(browser, opts) {
    const msg = (opt) => { return `PackPlugin: expected ${opt} opt`; };
    const check = (opt) => {
      if (typeof opts[opt] === 'undefined') {
        print(msg(opt), Color.red);
        process.exit(1);
      }
    };
    if (browser === 'firefox') {
      check('apiKey');
      check('apiSecret');
    }
  }
}

module.exports = PackPlugin;
