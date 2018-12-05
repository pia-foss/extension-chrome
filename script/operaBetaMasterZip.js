const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { print } = require('./util');

// Get Version
const versionFilePath = path.join(__dirname, '..', 'VERSION');
const versionFile = fs.readFileSync(versionFilePath, 'utf8');
const VERSION = versionFile.trim();

// Filepaths and Filenames
const filename = `private_internet_access-opera-v${VERSION}-beta`;
const crxFile = `${filename}.nex`;
const zipFile = `${filename}.zip`;
const infoFile = 'info-opera.md';
const masterZip = path.join(__dirname, '..', 'builds', `${filename}-release.zip`);

Promise.resolve()
  // create beta release zip file
  .then(() => {
    const buildsDir = path.join(__dirname, '..', 'builds');
    return execSync(`zip -r ${masterZip} ${crxFile} ${zipFile} ${infoFile}`, { cwd: buildsDir });
  })
  // clean up necessary files
  .then(() => {
    const buildsDir = path.join(__dirname, '..', 'builds');
    const crx = path.join(buildsDir, crxFile);
    const zip = path.join(buildsDir, zipFile);
    const info = path.join(buildsDir, infoFile);
    fs.unlinkSync(crx);
    fs.unlinkSync(zip);
    fs.unlinkSync(info);
  })
  // --- Errors ---
  .catch((err) => { print(err.toString()); });
