const {
  print,
  setEnv,
  generateExtension,
  opera,
} = require('./util');

// set up env vars
setEnv('build', 'webstore');
setEnv('audience', 'internal');
setEnv('gitinfo', 'yes');

Promise.resolve()
  // --- Opera ---
  .then(() => { return generateExtension(opera); })
  // --- Errors ---
  .catch((err) => { print(err); });
