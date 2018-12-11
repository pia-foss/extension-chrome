const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { print } = require('./util');

dotenv.config();

const buildsDir = path.join(__dirname, '..', 'builds');
const masterInfoFile = path.join(__dirname, '..', 'builds', 'info.json');
const masterZip = path.join(__dirname, '..', 'builds', 'beta-release.zip');

// Get Version
const versionFilePath = path.join(__dirname, '..', 'VERSION');
const versionFile = fs.readFileSync(versionFilePath, 'utf8');
const VERSION = versionFile.trim();

// Firefox Filepaths and Filenames
const ffDir = path.join(process.env.FF_BUILD_DIR);
const ffVersion = process.env.FF_VERSION;
const xpiFile = `${ffDir}private_internet_access-firefox-v${ffVersion}-beta.xpi`;
const fInfoFile = `${ffDir}info-firefox.json`;
const localXpiFile = path.join(__dirname, '..', 'builds', `private_internet_access-firefox-v${ffVersion}-beta.xpi`);

// Firefox Filepaths and Filenames
const filename = `private_internet_access-chrome-v${VERSION}-beta`;
const crxFile = path.join(buildsDir, `${filename}.crx`);
const zipFile = path.join(buildsDir, `${filename}.zip`);
const cInfoFile = path.join(buildsDir, 'info-chrome.json');

// Opera Filepaths and Filenames
const oFilename = `private_internet_access-opera-v${VERSION}-beta`;
const nexFile = path.join(buildsDir, `${oFilename}.nex`);
const oZipFile = path.join(buildsDir, `${oFilename}.zip`);
const oInfoFile = path.join(buildsDir, 'info-opera.json');

const generateInfoFile = (filePath) => {
  const infoFile = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(infoFile);
};

Promise.resolve()
  .then(() => {
    const info = {
      versions: {
        opera: [],
        chrome: [],
        firefox: [],
      },
      install_instructions: {
        chrome: {
          '': '<li>Drag and drop the downloaded file onto the <a href="chrome://extensions" target="_blank">Chrome extensions page</a>.</li>\n<li>Click "Add extension"</li>\n',
          win: '<li>Unzip the file into a directory of your choosing. Please ensure that this folder is not easily deleted or modified by accident. We recommend the <q>C:\\privateinternetaccess\\beta\\chrome</q></li>\n<li>Open your chrome browser and navigating to <a href="chrome://extensions" target="_blank">Chrome extensions page</a>.</li>\n<li>Enable <q>Developer Mode</q> by clicking on the switch on the top right.</li>\n<li>Click on the <q>LOAD UNPACKED</q> link near the top of page and navigate to the directory where you unzipped the previous file.</li>\n<li>This will add the extension.</li>\n<li>You may encounter a warning from Chrome with the header, <q>Disable developer mode extensions.</q> Please click cancel on this warning.</li>\n',
        },
        opera: {
          '': '<li>Drag and drop the downloaded file onto the Opera extensions page. Visit <q>opera://extensions</q> to get to that page.</li>\n<li>Click "Add extension"</li>\n',
          win: '<li>Unzip the file into a directory of your choosing. Please ensure that this folder is not easily deleted or modified by accident. We recommend the <q>C:\\privateinternetaccess\\beta\\opera</q></li>\n<li>Open your Opera browser and navigate to the Opera extensions page by visiting <q>opera://extensions</q></li>\n<li>Enable <q>Developer Mode</q> by clicking on the switch on the top right.</li>\n<li>Click on the <q>Load Unpacked Extension</q> link near the top of page and navigate to the directory where you unzipped the previous file.</li>\n<li>This will add the extension.</li>\n<li>You may encounter a warning from Opera with the header, <q>Disable developer mode extensions.</q> Please click cancel on this warning.</li>\n',
        },
        firefox: {
          '': '<li>Drag and drop the downloaded file onto the <a href="about:addons" target="_blank">Firefox addons page</a>.</li>\n<li>Click "Add"</li>\n',
        },
      },
    };

    return info;
  })
  // import firefox info file
  .then((data) => {
    const info = data;
    const firefoxInfo = generateInfoFile(fInfoFile);
    info.versions.firefox.push(firefoxInfo);
    return info;
  })
  // import chrome info file
  .then((data) => {
    const info = data;
    const chromeInfo = generateInfoFile(cInfoFile);
    info.versions.chrome.push(chromeInfo);
    return info;
  })
  // import chrome info file
  .then((data) => {
    const info = data;
    const operaInfo = generateInfoFile(oInfoFile);
    info.versions.opera.push(operaInfo);
    return info;
  })
  // write info.json file
  .then((data) => {
    return fs.writeFileSync(masterInfoFile, JSON.stringify(data, null, 2));
  })
  // move xpi file into builds
  .then(() => {
    return fs.copyFileSync(xpiFile, localXpiFile);
  })
  // create beta release zip file
  .then(() => {
    const xpi = `private_internet_access-firefox-v${ffVersion}-beta.xpi`;
    const crx = `${filename}.crx`;
    const zip = `${filename}.zip`;
    const nex = `${oFilename}.nex`;
    const oZip = `${oFilename}.zip`;
    const info = `info.json`;
    return execSync(`zip -r ${masterZip} ${crx} ${zip} ${nex} ${oZip} ${xpi} ${info}`, { cwd: buildsDir });
  })
  // clean up necessary files
  .then(() => {
    // chrome
    fs.unlinkSync(crxFile);
    fs.unlinkSync(zipFile);
    fs.unlinkSync(cInfoFile);

    // opera
    fs.unlinkSync(nexFile);
    fs.unlinkSync(oZipFile);
    fs.unlinkSync(oInfoFile);

    // firefox
    fs.unlinkSync(localXpiFile);
    fs.unlinkSync(xpiFile);
    fs.unlinkSync(fInfoFile);

    // info file
    fs.unlinkSync(masterInfoFile);
  })
  // --- Errors ---
  .catch((err) => { print(err.toString()); });
