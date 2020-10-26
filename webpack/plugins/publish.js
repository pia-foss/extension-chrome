const Webstore = require('chrome-webstore-upload');
const fs = require('fs');
const { join } = require('path');

const { print, Color, getVersion } = require('../util');

class PublishPlugin {
  constructor(opts) {
    PublishPlugin.validate(['id'], opts);
    PublishPlugin.validate(['keys', 'clientId'], opts);
    PublishPlugin.validate(['keys', 'clientSecret'], opts);
    PublishPlugin.validate(['keys', 'refreshToken'], opts);
    PublishPlugin.validate(['id'], opts);
    PublishPlugin.validate(['hook'], opts);

    this.hook = opts.hook;
    this.id = opts.id;
    this.keys = opts.keys;
    this.target = opts.target || 'default';
  }

  getWebstoreUrl() {
    return `https://chrome.google.com/webstore/detail/private-internet-access/${this.id}`;
  }

  pendingAnnoucement() {
    if (this.target === 'internal') {
      return `New extension *v${getVersion()}* published for *testers*\n`
        + `URL: ${this.getWebstoreUrl()}\n`
        + `It will be available on store after review, which can take up to 60 minutes.`;
    }

    return `New extension *v${getVersion()}* published for *all PIA users*.\n`
      + `URL: ${this.getWebstoreUrl()}\n`
      + `It will be available on store after review, which can take up to 60 minutes.`;
  }

  releaseAnnouncement() {
    if (this.target === 'internal') {
      return `New extension *v${getVersion()}* published for *testers*.\n`
        + `URL: ${this.getWebstoreUrl()}\n`
        + `It can take up to 15 minutes to become available on the store.`;
    }

    return `New extension *v${getVersion()}* published for *all PIA users*.\n`
      + `URL: ${this.getWebstoreUrl()}\n`
      + `It can take up to 15 minutes to become available on the store.`;
  }

  apply(compiler) {
    compiler.hooks[this.hook].tapPromise('PublishPlugin', async (dir, filename) => {
      try {
        const {
          clientId,
          clientSecret,
          refreshToken,
        } = this.keys;
        const webstore = new Webstore({
          extensionId: this.id,
          clientId,
          clientSecret,
          refreshToken,
        });
        const token = await webstore.fetchToken();
        const readStream = fs.createReadStream(join(dir, filename));
        const uploadResult = await webstore.uploadExisting(readStream, token);
        if (uploadResult.uploadState !== 'SUCCESS') {
          const msg = uploadResult.itemError
            .map((e) => { return e.error_detail; })
            .join(',');
          throw new Error(msg);
        }
        const publishResult = await webstore.publish(this.target, token);
        let msg;
        if (publishResult.status.includes('ITEM_PENDING_REVIEW')) {
          msg = this.pendingAnnoucement();
        }
        else if (publishResult.status.includes('OK')) {
          msg = this.releaseAnnouncement();
        }
        else {
          throw new Error(publishResult);
        }
        print(msg);
        print('PublishPlugin: completed successfully');
      }
      catch (err) {
        print('PublishPlugin: failed with error', Color.red);
        print(err.message || err, Color.red);
      }
    });
  }

  static validate(path, opts) {
    if (!opts) {
      throw new Error('PublishPlugin requires opts');
    }
    let target = opts;
    let name = 'opts';
    path.forEach((key) => {
      target = target[key];
      name = `${name}.${key}`;
      if (typeof target === 'undefined' || target === null) {
        throw new Error(`PublishPlugin requires ${name}`);
      }
    });
  }
}

module.exports = PublishPlugin;
