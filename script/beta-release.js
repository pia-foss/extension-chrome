const fs = require('fs');
const { join } = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { print, getVersion, getBuildsDir } = require('./common/util');

dotenv.config();

const VERSION = getVersion();
const buildsDir = getBuildsDir();
const masterInfoFile = join(buildsDir, 'info.json');
const masterZip = join(buildsDir, 'beta-release.zip');

// Firefox Filepaths and Filenames
const pia = 'private_internet_access';
const ffDir = join(process.env.FF_BUILD_DIR);
const ffVersion = process.env.FF_VERSION;
const xpiFile = `${ffDir}${pia}-firefox-v${ffVersion}-beta.xpi`;
const fInfoFile = `${ffDir}info-firefox.json`;
const localXpiFile = join(buildsDir, `${pia}-firefox-v${ffVersion}-beta.xpi`);

// Chrome Filepaths and Filenames
const filename = `${pia}-chrome-v${VERSION}-beta`;
const zipFile = join(buildsDir, `${filename}.zip`);
const cInfoFile = join(buildsDir, 'info-chrome.json');

// Opera Filepaths and Filenames
const oFilename = `${pia}-opera-v${VERSION}-beta`;
const oZipFile = join(buildsDir, `${oFilename}.zip`);
const oInfoFile = join(buildsDir, 'info-opera.json');

const getInfoFile = (filePath) => {
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
          '': '<li>Unzip the file into a directory of your choosing. Please ensure that this folder is not easily deleted or modified by accident. We recommend the <q>~/privateinternetaccess/beta/chrome</q></li>\n<li>Open your chrome browser and navigating to <a href="chrome://extensions" target="_blank">Chrome extensions page</a>.</li>\n<li>Enable <q>Developer Mode</q> by clicking on the switch on the top right.</li>\n<li>Click on the <q>LOAD UNPACKED</q> link near the top of page and navigate to the directory where you unzipped the previous file.</li>\n<li>This will add the extension.</li>\n<li>You may encounter a warning from Chrome with the header, <q>Disable developer mode extensions.</q> Please click cancel on this warning.</li>\n',
          win: '<li>Unzip the file into a directory of your choosing. Please ensure that this folder is not easily deleted or modified by accident. We recommend the <q>C:\\privateinternetaccess\\beta\\chrome</q></li>\n<li>Open your chrome browser and navigating to <a href="chrome://extensions" target="_blank">Chrome extensions page</a>.</li>\n<li>Enable <q>Developer Mode</q> by clicking on the switch on the top right.</li>\n<li>Click on the <q>LOAD UNPACKED</q> link near the top of page and navigate to the directory where you unzipped the previous file.</li>\n<li>This will add the extension.</li>\n<li>You may encounter a warning from Chrome with the header, <q>Disable developer mode extensions.</q> Please click cancel on this warning.</li>\n',
        },
        opera: {
          '': '<li>Unzip the file into a directory of your choosing. Please ensure that this folder is not easily deleted or modified by accident. We recommend the <q>~/privateinternetaccess/beta/opera</q></li>\n<li>Open your Opera browser and navigate to the Opera extensions page by visiting <q>opera://extensions</q></li>\n<li>Enable <q>Developer Mode</q> by clicking on the switch on the top right.</li>\n<li>Click on the <q>Load Unpacked Extension</q> link near the top of page and navigate to the directory where you unzipped the previous file.</li>\n<li>This will add the extension.</li>\n<li>You may encounter a warning from Opera with the header, <q>Disable developer mode extensions.</q> Please click cancel on this warning.</li>\n',
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
    const firefoxInfo = getInfoFile(fInfoFile);
    info.versions.firefox.push(firefoxInfo);
    return info;
  })
  // import chrome info file
  .then((data) => {
    const info = data;
    const chromeInfo = getInfoFile(cInfoFile);
    info.versions.chrome.push(chromeInfo);
    return info;
  })
  // import chrome info file
  .then((data) => {
    const info = data;
    const operaInfo = getInfoFile(oInfoFile);
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
    const xpi = `${pia}-firefox-v${ffVersion}-beta.xpi`;
    const zip = `${filename}.zip`;
    const oZip = `${oFilename}.zip`;
    const info = `info.json`;
    // For windows compatibility we can use;
    // `Compress-Archive -Path ${zip} ${oZip} ${xpi} ${info} -DestinationPath ${masterZip}`
    return execSync(`zip -r ${masterZip} ${zip} ${oZip} ${xpi} ${info}`, { cwd: buildsDir });
  })
  // clean up necessary files
  .then(() => {
    // chrome
    fs.unlinkSync(zipFile);
    fs.unlinkSync(cInfoFile);

    // opera
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
  .catch(print);
