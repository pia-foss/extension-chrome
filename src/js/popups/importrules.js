import 'babel-polyfill';
import { onMessage, Type, Target } from '../helpers/messaging';

chrome.runtime.getBackgroundPage(({ app }) => {
  const {
    util: {
      bypasslist,
      i18n: { t },
    },
    logger: { debug },
  } = app;

  /**
   * Get the file input
   *
   * @returns {HTMLInputElement}
   */
  function getInput() {
    return document.getElementById('import-file-input');
  }

  /**
   * Get the input label
   *
   * @returns {HTMLLabelElement}
   */
  function getLabel() {
    return document.getElementById('import-file-label');
  }

  function getCurrentWindowID() {
    return new Promise((resolve) => {
      chrome.windows.getCurrent(({ id: windowID }) => {
        resolve(windowID);
      });
    });
  }

  async function closeWindow() {
    const windowID = await getCurrentWindowID();

    return new Promise((resolve) => {
      chrome.windows.remove(windowID, (...args) => {
        resolve(...args);
      });
    });
  }

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

  /**
   * Set error for invalid file
   */
  function setInvalidFileError() {
    setError(t('InvalidImportFileStructure'));
  }

  /**
   * Clear the error message
   */
  function clearError() {
    setError('');
  }

  /**
   * Attempt to parse the JSON file
   *
   * Sets error message if parsing fails
   */
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
    allRules.forEach((rule) => {
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
    const { result } = this;
    let rules;
    try {
      rules = parse(result);
    }
    catch (err) {
      debug('importrules.js: failed to parse rules file, ensure valid JSON');
      return;
    }
    bypasslist.importRules(rules);
    closeWindow();
  }

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
  }

  /**
   * Handle clicking of file input
   *
   * Clear current files and re-register the onfilechange listener
   *
   * @this {HTMLInputElement}
   */
  function onImportClick() {
    this.removeEventListener('change', onFileChange);
    this.value = null;
    this.addEventListener('change', onFileChange);
  }

  /**
   * Update the label text
   *
   * @param label {HTMLLabelElement}
   */
  function updateLabel(label) {
    // eslint-disable-next-line no-param-reassign
    label.innerHTML = t('ImportLabel');
  }

  onMessage(
    {
      target: Target.POPUPS,
      type: Type.FOREGROUND_OPEN,
    },
    closeWindow,
  );
  const label = getLabel();
  const input = getInput();
  updateLabel(label);
  input.addEventListener('click', onImportClick);
});
