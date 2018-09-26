const {generateExtension, opera} = require('./util');

// set up env vars
process.env.build = 'webstore'; // eslint-disable-line no-process-env

console.log(`BUILD=${process.env.build}`); // eslint-disable-line no-process-env

// --- Opera ---
generateExtension(opera)
.catch((err) => { console.log(err); });
