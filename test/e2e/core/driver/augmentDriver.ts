import { getConfig } from '../util/config';
import { Driver, ChromeDriver } from '.';
import { By, until } from 'selenium-webdriver';

function augmentDriver(chromeDriver: ChromeDriver): Driver {
  const { waitTime } = getConfig();
  const driver: Driver = Object.assign(Object.create(chromeDriver), {
    waitAndFindElement(by: By) {
      return chromeDriver.wait(until.elementLocated(by), waitTime);
    },
  });

  return driver;
}

export { augmentDriver };
