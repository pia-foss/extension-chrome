const { join } = require('path');
const crypto = require('crypto');
const fs = require('fs');
const {
  dist,
  root,
  print,
  Color,
  getVersion,
  getGitHash,
  formatFilename,
} = require('../util');

class BrowserInfoPlugin {
  constructor(opts = {}) {
    this.version = opts.version || getVersion();
    if (!process.env.RELEASE_DATE) { throw new Error('must set RELEASE_DATE environment variable'); }
    if (!opts.zipHook) { throw new Error('BrowserInfoPlugin requires "hook" opt'); }
    this.zipHook = opts.zipHook;
    this.date = opts.releaseDate;
    this.getCommitHash = opts.getCommitHash || getGitHash;
    this.dest = opts.dest || dist('..');
    this.filename = opts.filename || formatFilename('info-[browser].json');
    this.changelogPath = opts.changelogPath || root('CHANGELOG.md');
    this.changelogStart = process.env.CHANGELOG_START;
    this.changelogEnd = process.env.CHANGELOG_END;
    if (!this.changelogEnd || !this.changelogStart) {
      throw new Error('must set CHANGELOG_START and CHANGELOG_END environment variables');
    }
  }

  getInfoPromise() {
    if (!this.infoPromise) {
      this.infoPromise = Promise.all([
        // zip promise
        new Promise((resolve) => {
          this.resolveZipped = resolve;
        }),
      ]).then(async ([{ zippedFilename, zippedDir }]) => {
        await this.writeInfoFile({
          zippedDir,
          zippedFilename,
        });
      });
    }
    return this.infoPromise;
  }

  getChanges() {
    const changelog = [];
    const clFile = fs.readFileSync(this.changelogPath, 'utf8').trim();

    let content = clFile.split(this.changelogStart)[1];
    content = content.split(this.changelogEnd)[0].trim();
    content = content.split('*');

    content.forEach((line) => {
      if (line) { changelog.push(line.trim()); }
    });

    return changelog;
  }

  async writeInfoFile({
    zippedDir,
    zippedFilename,
  }) {
    try {
      const downloadUrl = 'https://installers.privateinternetaccess.com/download';
      const zippedPath = join(zippedDir, zippedFilename);
      const zipHash = await BrowserInfoPlugin.hash(zippedPath);
      const info = {
        version: this.version,
        available: true,
        daet: this.date,
        commit: await Promise.resolve(this.getCommitHash()),
        changes: [...this.getChanges()],
        installers: [
          {
            platform: 'win',
            platform_title: 'Windows',
            url: `${downloadUrl}/${zippedFilename}`,
            sha: zipHash,
          },
          {
            platform: '',
            platform_title: 'Mac / Linux / Other',
            url: `${downloadUrl}/${zippedFilename}`,
            sha: zipHash,
          },
        ],
      };
      const file = JSON.stringify(info, null, 2);
      fs.writeFileSync(join(this.dest, this.filename), file);
      print(`BrowserInfoPlugin: successfully wrote info to ${this.filename}`);
    }
    catch (err) {
      print('BrowserInfoPlugin: failed with error', Color.red);
      print(err.message || err, Color.red);
    }
  }

  apply(compiler) {
    const { zipHook } = this;
    compiler.hooks[zipHook].tapPromise('BrowserInfoPlugin', async (zippedDir, zippedFilename) => {
      const infoPromise = this.getInfoPromise();
      this.resolveZipped({ zippedDir, zippedFilename });
      await infoPromise;
    });
  }

  static async hash(filepath) {
    const shasum = crypto.createHash('sha256');
    return new Promise((resolve) => {
      const input = fs.createReadStream(filepath);
      input.on('readable', () => {
        const data = input.read();
        if (data) {
          shasum.update(data);
        }
        else {
          resolve(shasum.digest('hex'));
        }
      });
    });
  }
}

module.exports = BrowserInfoPlugin;
