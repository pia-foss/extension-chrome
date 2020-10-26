const fs = require('fs');
const { join } = require('path');

function print(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

function getBuildsDir() {
  return join(__dirname, '..', '..', 'builds');
}

function getProjectRoot() {
  return join(__dirname, '..', '..');
}

function setEnv(key, value) {
  process.env[key] = value;
  print(`${key}=${value}`);
}

function getVersion() {
  const versionFilePath = join(__dirname, '..', '..', 'VERSION');
  const versionFile = fs.readFileSync(versionFilePath, 'utf8');
  return versionFile.trim();
}

function getChangelog(start, end) {
  const changelog = [];
  const clFilePath = join(__dirname, '..', '..', 'CHANGELOG.md');
  const clFile = fs.readFileSync(clFilePath, 'utf8').trim();

  let content = clFile.split(start)[1];
  content = content.split(end)[0].trim();
  content = content.split('*');

  content.forEach((line) => {
    if (line) { changelog.push(line.trim()); }
  });

  return changelog;
}

module.exports = {
  print,
  setEnv,
  getVersion,
  getChangelog,
  getBuildsDir,
  getProjectRoot,
};
