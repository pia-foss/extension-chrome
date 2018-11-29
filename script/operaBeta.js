const {
  print,
  setEnv,
  generateExtension,
  opera,
} = require('./util');

setEnv('build', 'webstore');
setEnv('audience', 'beta');

Promise.resolve()
  // --- Opera ---
  .then(() => { return generateExtension(opera); })
  // --- Errors ---
  .catch((err) => { print(err); });
