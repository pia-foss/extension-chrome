const fs = require('fs-extra');
const path = require('path');
const {execSync, exec} = require('child_process');


// variables
const mac = 'darwin';
const linux = 'linux';
const opera = 'opera';
const chrome = 'chrome';
const platform = process.platform;
const webstoreDir = path.join(__dirname, '..', 'builds', 'webstore');
const webstoreKey = path.join(__dirname, '..', 'webstore.pem');
const VERSION = fs.readFileSync(path.join(__dirname, '..', 'VERSION')).toString().trim();


// generate the command to pack the extension
const generatePackCommand = function (browser) {
  // general pack flags
  const packExtension = `--pack-extension=${webstoreDir}`;
  const packExtensionKey = `--pack-extension-key=${webstoreKey}`;
  const chromeMacApp = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome`;
  const chromeLinuxApp = `chromium-browser`;
  const operaMacApp = `/Applications/Opera.app/Contents/MacOS/Opera`;
  const operaLinuxApp = `opera`;

  // os dependant browser location
  let command;
  if (browser === chrome && platform === mac) { command = `${chromeMacApp}`; }
  else if (browser === chrome && platform === linux) { command = `${chromeLinuxApp}`; }
  else if (browser === opera && platform === mac) { command = `${operaMacApp}`; }
  else if (browser === opera && platform === linux) { command = `${operaLinuxApp}`; }
  return command + ` ${packExtension} ${packExtensionKey}`;
};

const generateWebstoreFilePath = function(browser) {
  let webstoreFile = path.join(__dirname, '..', 'builds', 'webstore.');
  if (browser === chrome) { webstoreFile += 'crx'; }
  else if (browser === opera) { webstoreFile += 'nex'; }
  return webstoreFile;
};

const generateFilePath = function (browser) {
  let filename = `private_internet_access-${browser}-v${VERSION}.`;
  if (browser === chrome) { filename += 'crx'; }
  else if (browser === opera) { filename += 'nex'; }
  return path.join(__dirname, '..', 'builds', filename);
};

const compileCode = function (browser, release = false) {
  // generate a build and pack the extension
  return new Promise((resolve, reject) => {
    console.log(`--- Building for ${browser}`);
    process.env.browser = browser; // eslint-disable-line no-process-env

    console.log('compiling code...');
    const gruntCommand = release ? 'grunt release' : 'grunt';
    const grunt = exec(gruntCommand);
    grunt.stdout.pipe(process.stdout);
    grunt.stderr.on('data', (err) => { return reject(err); });
    grunt.on('exit', () => { return resolve(); });
  });
};

const packExtension = function (browser) {
  // package using Chrome browser
  console.log('packing through browser...');
  try { execSync(generatePackCommand(browser)); }
  catch (err) { throw new Error(err); }

  fs.moveSync(generateWebstoreFilePath(browser), generateFilePath(browser));
  console.log(`${browser} done`);
};

const generateExtension = function (browser) {
  // User Output
  console.log(`Launching from directory: ${__dirname}`);
  console.log(`Building extension version: ${VERSION}`);
  console.log(`Detected Platform: ${platform}`);

  // generate a build and pack the extension
  return compileCode(browser)
  .then(() => { return packExtension(browser); });
};


module.exports = {
  chrome: chrome,
  opera: opera,
  compileCode: compileCode,
  generateExtension: generateExtension
};
