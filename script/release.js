const {compileCode, chrome} = require('./util');

// set up env vars
process.env.build = 'webstore'; // eslint-disable-line no-process-env
process.env.audience = 'public'; // eslint-disable-line no-process-env

console.log(`BUILD=${process.env.build}`); // eslint-disable-line no-process-env
console.log(`AUDIENCE=${process.env.audience}`); // eslint-disable-line no-process-env

// --- Opera ---
compileCode(chrome, true)
.catch((err) => { console.log(err); });
