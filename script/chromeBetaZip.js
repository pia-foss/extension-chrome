const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { print } = require('./util');

const versionFilePath = path.join(__dirname, '..', 'VERSION');
const versionFile = fs.readFileSync(versionFilePath);
const VERSION = versionFile.toString().trim();

Promise.resolve()
  .then(() => {
    const webstoreDir = path.join(__dirname, '..', 'builds', 'webstore');
    const output = path.join(__dirname, '..', 'builds', `private_internet_access-chrome-v${VERSION}-beta.zip`);
    return execSync(`zip -r ${output} .`, { cwd: webstoreDir });
  })
  // --- Errors ---
  .catch((err) => { print(err.toString()); });
