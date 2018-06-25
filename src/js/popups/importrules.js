chrome.runtime.getBackgroundPage(({app}) => {
  const {
    util: {
      bypasslist,
      i18n: {t}
    },
    logger: {debug},
  } = app;

  /**
   * Called when the imported file has been read successfully
   *
   * @returns {void}
   */
  const loadEndListener = function () {
    const {result} = this;
    let rules;
    try {
      rules = JSON.parse(result);
    } catch (err) {
      debug('failed to parse rules file, ensure valid JSON');
      return;
    }
    bypasslist.importRules(rules);
    window.close();
  };

  /**
   * Listen for file to be uploaded
   *
   * @returns {void}
   */
  const onFileChange = function () {
    const [file] = this.files;
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('loadend', loadEndListener);
      reader.readAsText(file);
    }
  };

  document.getElementById('import-file-label').innerHTML = t('ImportLabel');
  document.getElementById('import-file-input').addEventListener('change', onFileChange);
});
