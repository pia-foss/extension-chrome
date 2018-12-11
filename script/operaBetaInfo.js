const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { print } = require('./util');

dotenv.config();

// Get Date
const date = process.env.RELEASE_DATE;

// Get Version
const versionFilePath = path.join(__dirname, '..', 'VERSION');
const versionFile = fs.readFileSync(versionFilePath, 'utf8');
const VERSION = versionFile.trim();

// Get Changelog
const clFilePath = path.join(__dirname, '..', 'CHANGELOG.md');
const clFile = fs.readFileSync(clFilePath, 'utf8');
const CHANGELOG = clFile.trim();

// Filepaths and Filenames
const filename = `private_internet_access-opera-v${VERSION}-beta`;
const crxFile = path.join(__dirname, '..', 'builds', `${filename}.nex`);
const zipFile = path.join(__dirname, '..', 'builds', `${filename}.zip`);
const infoFile = path.join(__dirname, '..', 'builds', 'info-opera.json');
const downloadUrl = 'https://installers.privateinternetaccess.com/download/';

const generateChangeLog = () => {
  const changelog = [];
  const changelogStart = process.env.CHANGELOG_START;
  const changelogEnd = process.env.CHANGELOG_END;
  let content = CHANGELOG.split(changelogStart)[1];
  content = content.split(changelogEnd)[0].trim();
  content = content.split('*');

  content.forEach((line) => {
    if (line) { changelog.push(line.trim()); }
  });

  return changelog;
};

const generateInfo = (checksums) => {
  const firefox = {
    version: VERSION,
    available: true,
    date,
    commit: checksums.commit,
    installers: [
      {
        platform: 'win',
        platform_title: 'Windows',
        url: `${downloadUrl}private_internet_access-opera-${VERSION}-beta.zip`,
        sha: checksums.zip,
      },
      {
        platform: '',
        platform_title: 'Mac / Linux / Other',
        url: `${downloadUrl}private_internet_access-opera-${VERSION}-beta.crx`,
        sha: checksums.crx,
      },
    ],
    changes: [...checksums.changelog],
  };

  return JSON.stringify(firefox);
};

Promise.resolve()
  // generate crx checksum
  .then(() => {
    const buildsDir = path.join(__dirname, '..', 'builds');
    const shasumBuffer = execSync(`shasum -a 256 ${crxFile}`, { cwd: buildsDir });
    const shasumString = shasumBuffer.toString();
    const shasum = shasumString.split(' ')[0];
    return { crx: shasum };
  })
  // generate zip checksum
  .then((data) => {
    const checksums = data;
    const buildsDir = path.join(__dirname, '..', 'builds');
    const shasumBuffer = execSync(`shasum -a 256 ${zipFile}`, { cwd: buildsDir });
    const shasumString = shasumBuffer.toString();
    const shasum = shasumString.split(' ')[0];
    checksums.zip = shasum;
    return checksums;
  })
  // get last git commit hash
  .then((data) => {
    const checksums = data;
    const hashBuffer = execSync('git rev-parse HEAD');
    const commitHash = hashBuffer.toString().trim();
    checksums.commit = commitHash;
    return checksums;
  })
  // generate changelog
  .then((checksums) => {
    const data = checksums;
    data.changelog = generateChangeLog();
    return data;
  })
  // generate info file
  .then((checksums) => {
    const releaseInfo = checksums;
    releaseInfo.date = date;
    const infoTemplate = generateInfo(releaseInfo);
    return fs.writeFileSync(infoFile, infoTemplate);
  })
  // --- Errors ---
  .catch((err) => { print(err.toString()); });
