const {
  print,
  setEnv,
  generateExtension,
  chrome,
} = require('./util');

setEnv('build', 'webstore');
setEnv('audience', 'beta');

Promise.resolve()
  // --- Chrome ---
  .then(() => { return generateExtension(chrome); })
  // --- Errors ---
  .catch((err) => { print(err); });
