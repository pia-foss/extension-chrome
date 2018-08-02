const {generateExtension, chrome, opera} = require('./util');

// set up env vars
process.env.build = 'webstore'; // eslint-disable-line no-process-env
process.env.gitinfo = 'yes'; // eslint-disable-line no-process-env

console.log(`BUILD=${process.env.build}`); // eslint-disable-line no-process-env
console.log(`GITINFO=${process.env.gitinfo}`); // eslint-disable-line no-process-env

// --- Chrome ---
generateExtension(chrome)
// --- Opera ---
.then(() => { return generateExtension(opera); })
.catch((err) => { console.log(err); });
