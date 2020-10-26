const { DefinePlugin } = require('webpack');
const { getGitHash, getGitBranch } = require('../util');

function GitInfoPlugin() {
  return new DefinePlugin({
    'process.env.COMMIT_HASH': JSON.stringify(getGitHash()),
    'process.env.GIT_BRANCH': JSON.stringify(getGitBranch()),
  });
}

module.exports = GitInfoPlugin;
