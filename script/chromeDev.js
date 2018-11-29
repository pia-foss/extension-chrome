const {
  compileCode,
  chrome,
  print,
  setEnv,
} = require('./util');

// set up env vars
setEnv('build', 'debug');
setEnv('audience', 'internal');
setEnv('gitinfo', 'yes');

// --- Chrome ---
compileCode(chrome)
  .catch((err) => { print(err); });
