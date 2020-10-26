const path = require('path');
const { execSync } = require('child_process');
const { AsyncParallelHook } = require('tapable');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const {
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
    this.source = dist();
    this.dest = opts.dest || dist('..');
    this.browser = opts.browser || getBrowser();
    this.build = opts.build || getBuild();
    this.platform = opts.platform || process.platform;
    this.useWebstoreKey = Boolean(opts.useWebstoreKey) || false;
    this.webstoreKey = opts.webstoreKey || '';
    this.version = opts.version || getVersion();
    this.filename = formatFilename(opts.filename)
      || defaultFilename();
  }

  packCommand() {
    const {
      source,
      browser,
      useWebstoreKey,
      webstoreKey,
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
      default: throw new Error(`unsupported browser: ${browser}`);
    }
    if (useWebstoreKey) {
      if (!webstoreKey) {
        throw new Error('missing webstore key');
      }
      command += ` --pack-extension-key=${webstoreKey}`;
    }
    command += ` --pack-extension=${source}`;

    return command;
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
        execSync(this.packCommand());
        await PackPlugin.remove(path.join(this.dest, `${getBuildDirName()}.pem`));
        const defaultFilePath = PackPlugin.getDefaultFilePath();
        const outputPath = this.getOutputPath();
        await this.checkFileExists(defaultFilePath, 3);
        fs.moveSync(defaultFilePath, outputPath);
        print('PackPlugin: completed successfully');
        compiler.hooks.packed.promise(this.dest, this.filename);
      }
      catch (err) {
        print('PackPlugin: failed with error', Color.red);
        print(err.message || err, Color.red);
        print('try packing via browser UI to debug', Color.red);
        throw err.message || err;
      }
    });
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

  static getDefaultFilePath() {
    const dirName = getBuildDirName();
    const ext = getExt();
    const filepath = dist('..', `${dirName}.${ext}`);
    return filepath;
  }

  static async remove(filepath) {
    return new Promise((resolve, reject) => {
      rimraf(filepath, (err) => {
        if (err) { reject(err); }
        else { resolve(); }
      });
    });
  }
}

module.exports = PackPlugin;
