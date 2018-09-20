import { Options } from 'selenium-webdriver/chrome';

import { root } from '../util/root';

function getBuild() {
  const build = process.env.build;
  if (!build) {
    throw new Error(`
      could not find 'build' environment variables
    `);
  }

  return build;
}

async function createOptions(): Promise<Options> {
  const options = new Options();
  const extensionPath = root('builds', getBuild());
  options.addArguments(
    '--no-sandbox',
    `--load-extension=${extensionPath}`,
  );

  return options;
}

export { createOptions };
