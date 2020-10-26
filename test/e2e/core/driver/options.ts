import { Options } from 'selenium-webdriver/chrome';

import { root } from '../util/root';

function getBuildDir() {
  const build = process.env.BUILD;
  const browser = process.env.BROWSER;
  if (!build || !browser) {
    throw new Error(`
      could not find one of 'BUILD' or 'BROWSER' environment variables
    `);
  }

  return `${browser}-${build}`;
}

async function createOptions(): Promise<Options> {
  const options = new Options();
  const extensionPath = root('builds', getBuildDir());
  options.addArguments(
    '--no-sandbox',
    `--load-extension=${extensionPath}`,
  );

  return options;
}

export { createOptions };
