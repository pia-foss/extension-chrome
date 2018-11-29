const {
  print,
  setEnv,
  generateExtension,
  chrome,
} = require('./util');

// set up env vars
setEnv('build', 'webstore');
setEnv('audience', 'internal');
setEnv('gitinfo', 'yes');

Promise.resolve()
  // --- Chrome ---
  .then(() => { return generateExtension(chrome); })
  // --- Errors ---
  .catch((err) => { print(err); });
