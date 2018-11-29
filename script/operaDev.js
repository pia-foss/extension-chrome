const {
  compileCode,
  opera,
  print,
  setEnv,
} = require('./util');

// set up env vars
setEnv('build', 'debug');
setEnv('audience', 'internal');
setEnv('gitinfo', 'yes');

// --- Opera ---
compileCode(opera)
  .catch((err) => { print(err); });
