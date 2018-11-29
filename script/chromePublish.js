const {
  setEnv,
  compileCode,
  chrome,
  print,
} = require('./util');

setEnv('build', 'webstore');
setEnv('audience', 'public');

// --- Chrome (Publish on store) ---
compileCode(chrome, true)
  .catch((err) => { print(err); });
