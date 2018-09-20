import {
  By,
  WebElement,
  until,
  Condition,
} from 'selenium-webdriver';
import { expect } from 'chai';

import { DriverFactory } from '../driver';
import { bySelector } from '../util/bySelector';
import { Selector } from './selector';
import { getConfig } from '../util/config';
// TODO: Enforce no unused

interface ElementDescriptor {
  name: string;
  selector: Selector;
}

type Operation<T> = (by: By) => Promise<T>;

type LazyChain = LazyWebElement[];

/**
 * Wrapper around selenium WebElement
 *
 * Provides lazy access to an underlying web element, making it so
 * the element in question does not have to exist on the page yet
 * when a {@link LazyWebElement} is instantiated
 */
class LazyWebElement {
  private static WAIT_TIME = getConfig().WAIT_TIME;
  private selector: Selector;
  private name: string;
  private by: By;

  constructor({ name, selector }: ElementDescriptor) {
    this.selector = selector;
    this.name = name;
    this.by = bySelector(selector);
  }

  private get driver() {
    return DriverFactory.getDriver();
  }

  public get expect() {
    // TODO: Replace with chai plugins
    // tslint:disable-next-line no-this-assignment
    const context = this;
    let not = false;
    const value = {
      get not() {
        not = !not;
        return value;
      },

      get exists() {
        return context.expectExists(!not);
      },
      get visible() {
        return context.expectVisible(!not);
      },
    };

    return value;
  }

  private async expectExists(expected = true): Promise<void> {
    let exists: boolean;
    try {
      const el = await this.waitAndFindElement();
      exists = Boolean(el);
    }
    catch {
      exists = false;
    }

    const to = expected ? 'to' : 'not to';

    expect(exists, `expected ${this} ${to} exist`).to.eq(expected);
  }

  private async expectVisible(expected = true): Promise<void> {
    let visible: boolean;
    try {
      const el = await this.waitAndFindVisibleElement();
      visible = Boolean(el);
    }
    catch {
      visible = false;
    }

    const be = expected ? 'be' : 'not be';

    expect(visible, `expected ${this} to ${be} visible`).to.eq(expected);
  }

  private operate<T>(operation: Operation<T>) {
    const by = bySelector(this.selector);

    return operation(by);
  }

  public waitAndFindElement(timeoutMultiplier = 1): Promise<WebElement> {
    const condition = until.elementLocated(this.by);

    return Promise.resolve(
      this.driver.wait(condition, LazyWebElement.WAIT_TIME * timeoutMultiplier),
    );
  }

  public waitAndFindVisibleElement(timeoutMultiplier = 1): Promise<WebElement> {
    const condition = new Condition(`for element to be visible ${this}`, async () => {
      const [element] = await this.findElements();
      if (element) {
        const displayed = await element.isDisplayed();
        return displayed && Promise.resolve(element);
      }
      return Promise.resolve(false);
    });

    return Promise.resolve(
      this.driver.wait<WebElement>(condition, LazyWebElement.WAIT_TIME * timeoutMultiplier),
    );
  }

  /**
   * Wait for the element to not exist
   *
   * @param [timeoutMultiplier] multiplier for wait time, defaults to 2
   * as waiting for elements to disappear is typically related to laoding gifs
   * that may take extra time
   */
  public waitForNotPresent(timeoutMultiplier = 2): Promise<void> {
    const condition = new Condition(`for element to not be present ${this}`, async () => {
      const { length } = await this.findElements();
      return length === 0;
    });

    return Promise.resolve(
      this.driver.wait<void>(condition, LazyWebElement.WAIT_TIME * timeoutMultiplier),
    );
  }

  public findElement(): Promise<WebElement> {
    const findElOp = (by: By) => {
      return Promise.resolve(this.driver.findElement(by));
    };

    return this.operate(findElOp);
  }

  public findElements(): Promise<WebElement[]> {
    const findElOp = (by: By) => {
      return Promise.resolve(this.driver.findElements(by));
    };

    return this.operate(findElOp);
  }

  public async findVisibleElements(): Promise<WebElement[]> {
    const allElements = await this.findElements();

    return allElements.filter((el) => {
      return el.isDisplayed();
    });
  }

  public findVisibleElement(): Promise<WebElement> {
    const findElOp = async (by: By) => {
      const el = await this.driver.findElement(by);
      const displayed = await el.isDisplayed();
      if (displayed) {
        return el;
      }

      // TODO: Ensure this matches findElement behavior
      throw new Error();
    };

    return this.operate(findElOp);
  }

  public findFromWebElement(parent: Promise<WebElement> | WebElement): Promise<WebElement[]> {
    const findElOp = async (by: By) => {
      const el = await Promise.resolve(parent);
      const op = el.findElements.bind(parent) as typeof el.findElements;

      return op(by);
    };

    return this.operate(findElOp);
  }

  public async findVisibleFromWebElement(
    parent: Promise<WebElement> | WebElement,
  ): Promise<WebElement[]> {
    const allElements = await this.findFromWebElement(parent);

    return allElements.filter((el) => {
      return el.isDisplayed();
    });
  }

  public toString() {
    return `<${this.name} ${this.selector.type}Selector="${this.selector.value}" />`;
  }
}

export { ElementDescriptor, LazyWebElement, LazyChain };
