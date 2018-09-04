import 'chromedriver';

import { DriverFactory } from '../driver';

function getBaseURL() {
  return Promise.resolve(`chrome-extension://${process.env.EXTENSION_ID}`);
}

/* Selenium Hooks */

beforeEach('global setup', async function () {
  const driver = await DriverFactory.createDriver();
  driver.baseURL = await getBaseURL();
});

afterEach('global teardown', async function () {
  await DriverFactory.destroyDriver();
});
