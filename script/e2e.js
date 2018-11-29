const { config } = require('dotenv');

const {
  setEnv,
  runMochaTests,
  print,
  root,
  chrome,
  compileCode,
  injectJsonProperty,
} = require('./util');

(async () => {
  try {
    // setup env
    config();

    setEnv('build', 'webstore');
    setEnv('audience', 'internal');
    setEnv('freezeApp', 0);

    print(`MANIFEST_KEY=${process.env.MANIFEST_KEY}`);
    print(`EXTENSION_ID=${process.env.EXTENSION_ID}`);
    print(`SKIP_BUILD=${process.env.SKIP_BUILD}`);

    // Get manifest path
    const manifestPath = root('builds', process.env.build, 'manifest.json');

    if (String(process.env.SKIP_BUILD) !== 'true') {
      print('\n\n-- building extension --\n\n');
      await compileCode(chrome);
    }
    print('\n\n-- injecting manifest key --\n\n');
    injectJsonProperty(manifestPath, {
      key: process.env.MANIFEST_KEY,
    });
    print('\n\n-- running tests --\n\n');
    await runMochaTests();
    print('\n\n-- completed --\n\n');
  }
  catch (err) {
    print(err);
  }
})();
