/**
 * Utility for working with File Blobs
 */
class File {
  /**
   * Constructor
   *
   * @param {string} fileType Type of file
   * @param {any[]} fileParts Parts to include in file blob
   * @param {function} debugLogger Logger
   */
  constructor (fileType, fileParts) {
    // Bindings
    this.download = this.download.bind(this);

    // Init
    this._blob = new Blob(fileParts, {type: fileType});
  }

  /**
   * Download the file
   *
   * @param {string} filename Name for file
   * @returns {Promise<void>} Resolves after cleanup has completed
   */
  download (filename) {
    debug(`initiating download of ${filename}`);
    return new Promise((resolve, reject) => {
      if ((chrome && chrome.downloads) || (browser && browser.downloads)) {
        debug('extension api available for download');
        const url = URL.createObjectURL(this._blob);
        this._downloadViaApi(filename, url, resolve);
      } else {
        const msg = 'extension api unavailable';
        debug(msg);
        reject(new Error(msg));
      }
    });
  }

  /**
   * Download via the extension API (requires permissions in manifest)
   *
   * @param {string} filename Name of file
   * @param {string} url Url for file
   * @param {function} resolve Promise resolution function
   * @returns {void}
   */
  _downloadViaApi (filename, url, resolve) {
    const {download} = (chrome || browser).downloads;
    download(
      {
        url,
        filename,
        saveAs: true,
      },
      () => {
        URL.revokeObjectURL(url);
        resolve();
      }
    );
  }
}

export {File};
