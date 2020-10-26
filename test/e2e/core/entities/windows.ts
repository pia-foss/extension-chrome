import { expect } from 'chai';

import { Driver } from '../driver';
import { Node } from './node';

interface WaitOpts {
  waitForVisible?: Node;
}

class Windows {
  private driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  private getCurrentUrl(): Promise<string> {
    return Promise.resolve(this.driver.getCurrentUrl());
  }

  public async expectTabExists(url: string) {
    expect.fail('not implemented');
  }

  /**
   * Expect the next tab to be the url
   *
   * @param {string} url Expected url
   */
  public async expectNextTabIs(expectedURL: string) {
    // Must wait, any interaction w/ tab while it's loading will
    // cause the page to never load
    await this.driver.sleep(5000);
    const handles = await this.driver.getAllWindowHandles();
    let nextHandleIndex: number;
    let currHandle: string = '';
    try {
      currHandle = await this.driver.getWindowHandle();
      const currHandleIndex = handles.indexOf(currHandle);
      if (currHandleIndex === handles.length - 1) {
        nextHandleIndex = 0;
      }
      else {
        nextHandleIndex = currHandleIndex + 1;
      }
    }
    catch {
      // The current handle has already been closed
      // Default to the first handle
      nextHandleIndex = 0;
    }
    const nextHandle = handles[nextHandleIndex];
    const switchTo = this.driver.switchTo();
    await switchTo.window(nextHandle);
    const currentUrl = await this.driver.getCurrentUrl();
    expect(currentUrl).to.eq(expectedURL);

    // If the current handle exists, switch back to it
    if (currHandle) {
      await switchTo.window(currHandle);
    }
  }

  public async expectCurrentUrlIs(expectedUrl: string) {
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).to.be.eq(expectedUrl);
  }

  public async expectCurrentTitleIs(expectedTitle: string) {
    const currentTitle = await this.driver.getTitle();
    expect(currentTitle).to.eq(expectedTitle);
  }

  public async expectCurrentTitleContains(expectedTitle: string) {
    const currentTitle = await this.driver.getTitle();
    expect(currentTitle).to.contain(expectedTitle);
  }

  /**
   * Open a new tab and focus it
   */
  async openTab(url: string) {
    expect.fail('not implemented');
  }

  async open(url: string, { waitForVisible }: WaitOpts = {}) {
    const nav = this.driver.navigate();
    await nav.to(url);
    if (waitForVisible) {
      await waitForVisible.waitExtraForVisible();
    }
  }

  async refresh({ waitForVisible }: WaitOpts = {}) {
    const nav = this.driver.navigate();
    await nav.refresh();
    if (waitForVisible) {
      await waitForVisible.waitExtraForVisible();
    }
  }
}

export { Windows };
