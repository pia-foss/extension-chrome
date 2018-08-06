import { onMessage, Type, Target } from '../helpers/messaging';

chrome.runtime.getBackgroundPage(({app}) => {
  const {
    util: {
      bypasslist,
      i18n: {t}
    },
    logger: {debug},
  } = app;

  const closeWindow = function () {
    chrome.windows.getCurrent(({ id }) => {
      chrome.windows.remove(id);
    });
  };

  /**
   * Set error message
   *
   * **DO NOT CALL WITH ANY USER INPUT**
   *
   * @param {string} msg Error message
   *
   * @returns {void}
   */
  function setError(msg) {
    debug(`importrules.js: ${msg}`);
    const [errElement] = document.getElementsByClassName('import-error');
    errElement.innerHTML = msg;

    return new Error(`importrules.js: ${msg}`);
  }

  function setInvalidFileError () {
    setError(t('InvalidImportFileStructure'));
  }

  function clearError() {
    setError('');
  }

  function parse(result) {
    let rules = null;
    try {
      rules = JSON.parse(result);
    }
    catch (_) {
      throw setInvalidFileError();
    }

    const { popularRules, userRules } = rules;
    if (!Array.isArray(popularRules) || !Array.isArray(userRules)) {
      throw setInvalidFileError();
    }

    const allRules = [...popularRules, ...userRules];
    allRules.forEach(function (rule) {
      if (typeof rule !== 'string') {
        throw setInvalidFileError();
      }
    });

    clearError();

    return rules;
  }

  /**
   * Called when the imported file has been read successfully
   *
   * @returns {void}
   */
  function loadEndListener() {
    const {result} = this;
    let rules;
    try {
      rules = parse(result);
    } catch (err) {
      debug('importrules.js: failed to parse rules file, ensure valid JSON');
      return;
    }
    bypasslist.importRules(rules);
    closeWindow();
  };

  /**
   * Listen for file to be uploaded
   *
   * @returns {void}
   */
  function onFileChange() {
    const [file] = this.files;
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('loadend', loadEndListener);
      reader.readAsText(file);
    }
  };

  onMessage(
    {
      target: Target.POPUPS,
      type: Type.FOREGROUND_OPEN,
    },
    closeWindow,
  );
  document.getElementById('import-file-label').innerHTML = t('ImportLabel');
  document.getElementById('import-file-input').addEventListener('change', onFileChange);
});
