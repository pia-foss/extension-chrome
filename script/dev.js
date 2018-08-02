const {compileCode, chrome} = require('./util');

// set up env vars
process.env.build = 'debug'; // eslint-disable-line no-process-env
process.env.gitinfo = 'yes'; // eslint-disable-line no-process-env

console.log(`BUILD=${process.env.build}`); // eslint-disable-line no-process-env
console.log(`GITINFO=${process.env.gitinfo}`); // eslint-disable-line no-process-env

// --- Opera ---
compileCode(chrome)
.catch((err) => { console.log(err); });
