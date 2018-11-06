const { config } = require('dotenv');

const {
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

    process.env.build = 'webstore';
    process.env.gitinfo = 'yes';
    process.env.browser = 'chrome';
    process.env.freezeApp = 0;

    print(`BUILD=${process.env.build}`);
    print(`GITINFO=${process.env.gitinfo}`);
    print(`BROWSER=${process.env.browser}`);
    print(`MANIFEST_KEY=${process.env.MANIFEST_KEY}`);
    print(`EXTENSION_ID=${process.env.EXTENSION_ID}`);
    print(`FREEZE_APP=${process.env.freezeApp}`);
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
