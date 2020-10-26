const fs = require('fs');
const { join } = require('path');

const { dist, print, Color } = require('../util');

class MovePlugin {
  constructor(...opts) {
    opts.forEach(MovePlugin.validate);
    this.opts = opts;
  }

  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise('MovePlugin', async () => {
      try {
        const pending = this.opts.map(MovePlugin.perform);
        await Promise.all(pending);
        print('MovePlugin: Completed successfully');
      }
      catch (err) {
        print('MovePlugin: error has occurred', Color.red);
        print(err.message || err, Color.red);
        if (err.message.includes('isFile')) {
          print('The latest LTS of NodeJS is required for this plugin', Color.red);
        }
      }
    });
  }

  static async perform({ dir, extension }) {
    const srcDir = dist();
    const destDir = dist(dir);
    if (srcDir === destDir) {
      throw new Error(`${srcDir} is used for both source and destination directory`);
    }
    await MovePlugin.createDir(destDir);
    const filenames = await MovePlugin.getFiles(srcDir, extension);
    const files = filenames.map((filename) => {
      return {
        srcFilepath: join(srcDir, filename),
        destFilepath: join(destDir, filename),
      };
    });
    const pending = files.map(async ({ srcFilepath, destFilepath }) => {
      await MovePlugin.move(srcFilepath, destFilepath);
    });
    await Promise.all(pending);
  }

  static async move(srcFile, destFile) {
    await MovePlugin.copy(srcFile, destFile);
    await MovePlugin.deleteFile(srcFile);
  }

  static async copy(srcFile, destFile) {
    await new Promise((resolve, reject) => {
      fs.copyFile(srcFile, destFile, (err) => {
        if (err) { reject(err); }
        else { resolve(); }
      });
    });
  }

  static async createDir(dir) {
    await new Promise((resolve, reject) => {
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err && err.code !== 'EEXIST') { reject(err); }
        else { resolve(); }
      });
    });
  }

  static async deleteFile(filepath) {
    await new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) { reject(err); }
        else { resolve(); }
      });
    });
  }

  static async getFiles(dir, ext) {
    const escapeExt = ext.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(`^.*\.${escapeExt}$`);
    const contents = await new Promise((resolve, reject) => {
      fs.readdir(dir, { withFileTypes: true }, (err, data) => {
        if (err) { reject(err); }
        else { resolve(data); }
      });
    });
    const files = contents
      .filter((dirent) => {
        return dirent.isFile();
      })
      .filter((dirent) => {
        return dirent.name.match(pattern);
      })
      .map((dirent) => { return dirent.name; });

    return files;
  }

  static validate({ dir, extension }) {
    const template = 'MovePlugin: requires "{0}" opt to be string';
    if (typeof extension !== 'string') {
      throw new Error(template.replace('{0}', 'extension'));
    }
    if (typeof dir !== 'string') {
      throw new Error(template.replace('{0}', 'dir'));
    }
  }
}

module.exports = MovePlugin;
