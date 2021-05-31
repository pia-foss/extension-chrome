function isBound(bound) {
  return (bound !== null && typeof bound === 'number');
}

/**
 * Check that the browser version is in range (start <= version <= end)
 *
 * This is an inclusive check
 *
 * (x, y) -> (x <= version <= y)
 * (null, y) -> (version <= y)
 * (x, null) -> (x <= version)
 *
 * @param {number|null|undefined} start - start of range
 * @param {number|null|undefined} end - end of range
 *
 * @returns {boolean} - whether $browserVersion is in range
 *
 * @example
   // version=72
   checkVersion(60, 72)     // true
   checkVersion(60, 71)     // false
   checkVersion(72)         // true
   checkVersion(73)         // false
   checkVersion(null, 72)   // true
   checkVersion(null, 71)   // false
   checkVersion(null, null) // error
 */
function checkBrowserVersion(start, end,app) {
  const {sameApp} = app;
  // get version
  const browser = sameApp.returnBrowser();
  const regex = browser == 'firefox' ? /^.*Firefox\/(\d+)\..*$/ : /^.*Chrome\/(\d+)\..*$/;
  const [, versionStr] = navigator.userAgent.match(regex);
  const version = Number(versionStr);

  // validate version
  if (Number.isNaN(Number(versionStr))) {
    debug('app/index.js: failed to parse userAgent for conditional bugfix');
    return true;
  }

  // check range
  if (isBound(start) && isBound(end)) {
    return (version >= start && version <= end);
  }
  if (isBound(start)) {
    return (version >= start);
  }
  if (isBound(end)) {
    return (version <= end);
  }
  const message = `checkVersion: failed to produce a valid range from: (${typeof start}, ${typeof end})`;
  debug(message);
  throw new Error(message);
}

export default checkBrowserVersion;
