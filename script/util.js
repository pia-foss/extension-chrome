const fs = require('fs-extra');
const path = require('path');
const { execSync, exec } = require('child_process');

function root(...filesOrDirs) {
  return path.resolve(__dirname, '..', ...filesOrDirs);
}

// variables
const mac = 'darwin';
const linux = 'linux';
const opera = 'opera';
const chrome = 'chrome';
const { platform } = process;
const webstoreDir = path.join(__dirname, '..', 'builds', 'webstore');
const executablesDir = root('node_modules', '.bin');
const webstoreKey = path.join(__dirname, '..', 'webstore.pem');
const VERSION = fs.readFileSync(path.join(__dirname, '..', 'VERSION')).toString().trim();

function print(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

function execWithOutput(command, rejectOnErr = false) {
  return new Promise((resolve, reject) => {
    print(`running command: ${command}`);
    const proc = exec(command);

    // Pipe output
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);

    // Resolve when completed
    proc.on('exit', () => {
      resolve();
    });

    // Reject shortly after error (to allow error messages to be written to stderr)
    let errTimeout = !rejectOnErr;
    proc.stderr.on('data', (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      if (!errTimeout) {
        errTimeout = setTimeout(() => {
          reject(new Error('Process terminated due to error'));
        }, 300);
      }
    });
  });
}

// generate the command to pack the extension
function generatePackCommand(browser) {
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
}

function generateWebstoreFilePath(browser) {
  let webstoreFile = path.join(__dirname, '..', 'builds', 'webstore.');
  if (browser === chrome) { webstoreFile += 'crx'; }
  else if (browser === opera) { webstoreFile += 'nex'; }
  return webstoreFile;
}

function generateFilePath(browser) {
  let filename = `private_internet_access-${browser}-v${VERSION}.`;
  if (browser === chrome) { filename += 'crx'; }
  else if (browser === opera) { filename += 'nex'; }
  return path.join(__dirname, '..', 'builds', filename);
}

function compileCode(browser, release = false) {
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
}

function packExtension(browser) {
  // package using Chrome browser
  console.log('packing through browser...');
  try { execSync(generatePackCommand(browser)); }
  catch (err) { throw new Error(err); }

  fs.moveSync(generateWebstoreFilePath(browser), generateFilePath(browser));
  console.log(`${browser} done`);
}

function generateExtension(browser) {
  // User Output
  console.log(`Launching from directory: ${__dirname}`);
  console.log(`Building extension version: ${VERSION}`);
  console.log(`Detected Platform: ${platform}`);

  // generate a build and pack the extension
  return compileCode(browser)
    .then(() => { return packExtension(browser); });
}

function runMochaTests() {
  const mochaPath = path.join(executablesDir, 'mocha');
  const command = `${mochaPath} test/e2e/**/*.spec.ts --opts test/e2e/mocha.opts`;
  return execWithOutput(command);
}

function injectJsonProperty(filePath, ...props) {
  const rawData = fs.readFileSync(filePath);
  const parsedData = JSON.parse(rawData);
  const updatedData = Object.assign({}, parsedData, ...props);
  const updatedJSON = JSON.stringify(updatedData);
  fs.writeFileSync(filePath, updatedJSON);
}

module.exports = {
  chrome,
  opera,
  compileCode,
  generateExtension,
  print,
  runMochaTests,
  root,
  injectJsonProperty,
};
