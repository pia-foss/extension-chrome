const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { print } = require('./util');

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
const infoFile = path.join(__dirname, '..', 'builds', 'info-opera.md');

const generateInfo = (checksums) => {
  return `
Version:
${VERSION}

Release Date:
{DateOfRelease}

Git Commit Hash:
${checksums.commit}

SHA Checksum:
zip: ${checksums.zip}
crx: ${checksums.crx}

ChangeLog:
${CHANGELOG}
`.trim();
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
  // generate info file
  .then((checksums) => {
    const infoTemplate = generateInfo(checksums);
    return fs.writeFileSync(infoFile, infoTemplate);
  })
  // --- Errors ---
  .catch((err) => { print(err.toString()); });
