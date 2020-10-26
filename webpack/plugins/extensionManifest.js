const fs = require('fs');
const {
  print,
  Color,
  getVersion,
} = require('../util');

class ExtensionManifestPlugin {
  constructor(options) {
    const defaultOptions = {
      template: null,
      version: null,
      filename: 'manifest.json',
      properties: {},
    };
    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('ExtensionManifestPlugin', (compilation, callback) => {
      try {
        const version = this.options.version || getVersion();
        let templatePromise;
        if (this.options.template) {
          templatePromise = new Promise((resolve, reject) => {
            fs.readFile(this.options.template, (err, data) => {
              if (err) { reject(err); }
              try {
                resolve(JSON.parse(data));
              }
              catch (parseErr) {
                reject(parseErr);
              }
            });
          });
        }
        else {
          templatePromise = Promise.resolve(null);
        }

        templatePromise
          .then((template) => {
            let json = {};
            const properties = this.options.properties || {};
            if (template) {
              json = Object.assign({}, json, template);
            }
            if (version) {
              json = Object.assign({}, json, { version });
            }
            json = Object.assign({}, json, properties);
            const filePayload = JSON.stringify(json);

            // eslint-disable-next-line no-param-reassign
            compilation.assets[this.options.filename] = {
              source() {
                return filePayload;
              },
              size() {
                return filePayload.length;
              },
            };
          })
          .then(() => {
            callback();
          })
          .catch((err) => {
            callback(err);
          });
        print('ExtensionManifestPlugin: Completed successfully');
      }
      catch (err) {
        print('ExtensionManifestPlugin: Failed with error', Color.red);
        print(err.message || err, Color.red);
      }
    });
  }
}

module.exports = ExtensionManifestPlugin;
