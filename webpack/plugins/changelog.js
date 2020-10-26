const marked = require('marked');
const fs = require('fs');
const { root, print, Color } = require('../util');

class ChangelogPlugin {
  constructor(opts) {
    // opts
    this.filename = opts.filename || 'CHANGELOG.html';
    this.source = opts.source || root('CHANGELOG.md');
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise('ChangelogPlugin', async (compilation) => {
      try {
        const html = await ChangelogPlugin.compileHtml(this.source);
        // eslint-disable-next-line no-param-reassign
        compilation.assets[this.filename] = {
          source() {
            return html;
          },
          size() {
            return html.length;
          },
        };
        print('ChangelogPlugin: Completed successfully');
      }
      catch (err) {
        print('ChangelogPlugin: Failed with error', Color.red);
        print(err.message || err, Color.red);
      }
    });
  }

  static async compileHtml(source) {
    // read file
    const markdown = await new Promise((resolve, reject) => {
      fs.readFile(source, { encoding: 'utf8' }, (err, data) => {
        if (err) { reject(err); }
        else { resolve(data); }
      });
    });

    marked.setOptions({ sanitize: false, smartypants: true, gfm: true });
    return marked(markdown);
  }
}

module.exports = ChangelogPlugin;
