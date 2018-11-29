const {
  setEnv,
  generateExtension,
  chrome,
  print,
} = require('./util');

setEnv('build', 'webstore');
setEnv('audience', 'public');

// --- Opera ---
generateExtension(chrome)
  .catch((err) => { print(err); });
