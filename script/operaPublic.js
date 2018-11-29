const {
  setEnv,
  generateExtension,
  opera,
  print,
} = require('./util');

setEnv('build', 'webstore');
setEnv('audience', 'public');

// --- Opera ---
generateExtension(opera)
  .catch((err) => { print(err); });
