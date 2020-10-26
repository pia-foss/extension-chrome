import { expect } from 'chai';
import { WebElementCondition, Condition, WebElement, error } from 'selenium-webdriver';

import { ElementDescriptor, LazyWebElement } from './lazyWebElement';
import { DriverFactory } from '../driver';
import { Actions, createActions } from './actions';
import { getConfig } from '../util/config';

/**
 * Used to provide useful functionality to user defined Elements
 */
export abstract class Node {
  private seleniumElement: LazyWebElement;
  private readonly parent?: Node;
  public readonly name: string;

  constructor(descriptor: ElementDescriptor, parent?: Node) {
    this.seleniumElement = new LazyWebElement(descriptor);
    this.parent = parent;
    this.name = descriptor.name;
  }

  private get lazyChain() {
    // tslint:disable-next-line:no-this-assignment
    let target: Node = this;
    let chain = [target];
    while (Node.exists(target.parent)) {
      target = target.parent;
      chain = [target, ...chain];
    }

    return chain;
  }

  /**
   * Offer expect API
   *
   * Automatically called with the current elements context and
   * includes a relevant message
   *
   * All API methods must be awaited
   */
  public get expect() {
    // for now this is just the same API the lazy element offers
    return this.seleniumElement.expect;
  }

  protected get element() {
    return this.getElement();
  }

  protected get actions(): Actions {
    return createActions(DriverFactory.getDriver());
  }

  protected get visibleElement() {
    const { waitTime } = getConfig();
    const message = `
      for element:

      ${this}

      to be visible
    `;
    const condition = new WebElementCondition(message, async () => {
      const [first, ...rest] = this.lazyChain;
      let [target] = await first.seleniumElement.findElements();
      for (const next of rest) {
        if (!target) {
          return false;
        }
        ([target] = await next.seleniumElement.findFromWebElement(target));
      }

      if (target && await target.isDisplayed()) {
        return target;
      }

      return false;
    });

    return this.driver.wait(condition, waitTime);
  }

  private get driver() {
    return DriverFactory.getDriver();
  }

  public selectorType() {
    return this.seleniumElement.selectorType();
  }

  public async moveTo({ x, y, duration }: { x?: number, y?: number, duration?: number }) {
    const element = await this.visibleElement;
    await this.actions.move({ x, y, duration, origin: element }).perform();
  }

  public async waitForVisible() {
    await this.seleniumElement.waitAndFindVisibleElement();
  }

  public async waitForNotPresent() {
    // Give time for the element to appear
    // Can be significantly less than the base time
    try {
      await this.seleniumElement.waitAndFindElement(1 / 4);
    } catch {
      // Element may have already disappeared, ignore errors
    }

    await this.seleniumElement.waitForNotPresent();
  }

  public async waitExtraForVisible() {
    await this.seleniumElement.waitAndFindVisibleElement(2);
  }

  public async getAttribute(attribute: string) {
    const el = await this.getElement();
    const attr = await el.getAttribute(attribute);
    return attr;
  }

  public toString() {
    const messages = this.lazyChain
      .map((base) => {
        return base.seleniumElement.toString();
      })
      .map((elementString, index) => {
        // tslint:disable-next-line:prefer-array-literal
        const tabs = new Array(index).map(() => {
          return '\t';
        });
        return `${tabs.join('')}${elementString}`;
      });

    return messages.join('\n');
  }

  public async hasClass(testClassName: string) {
    const el = await this.getElement();
    if (!el) { return false; }
    const classes = await el.getAttribute('class');
    return !!classes
      .split(' ')
      .filter((className) => { return !!className; })
      .find((className) => { return className === testClassName; });
  }

  public async expectClass(className: string) {
    const hasClass = await this.hasClass(className);
    expect(hasClass, `expected ${this} to have class: ${className}`).to.be.true;
  }

  protected async getElement() {
    const [element] = await this.getElements(1);
    return element;
  }

  public async expectCount(expected: number) {
    // if the expected is zero, we can't wait for it to equal zero
    let actual: number;
    try {
      const elements = await this.getElements(expected);
      actual = elements.length;
    }
    catch (err) {
      if (err instanceof error.TimeoutError) {
        actual = 0;
      }
      else {
        throw err;
      }
    }

    expect(actual, `expected ${expected} of ${this} but was ${actual}`).to.eq(expected);
  }

  /**
   * Wait for x elements to exits
   */
  protected getElements(expected?: number) {
    // Expected - expected # of elements
    // Actual - actual # of elements capable of being found by chain
    // Gathered - Number of elements discovered in a cycle
    //
    // If Expected < Actual, might return successfully before all of
    // Actual has been rendered
    //
    // Ex: Expected = 0, Actual = 1, might return [] because element
    // hasn't rendered yet
    //
    // Fix this issue by requiring Expected == Gathered for multiple
    // discovery cycles
    let totalCycles: number;
    if (typeof expected === 'undefined') { totalCycles = 4; }
    else if (expected === 0) { totalCycles = 3; }
    else { totalCycles = 2; }
    let cycles = totalCycles;
    let lastGathered: number;

    const message = `
      waiting for

        ${this}

      to exist
    `;

    return this.waitFor<WebElement[]>(message, async () => {
      const elementList = await this.getElementsWithoutWait();

      // Failfast
      if (!elementList) { return false; }

      // First run lastGathered undefined, reduce the cycle
      if (typeof lastGathered === 'undefined') {
        lastGathered = elementList.length;
        cycles -= 1;
      }
      // lastGathered not equal, reset the cycle
      else if (lastGathered !== elementList.length) {
        lastGathered = elementList.length;
        cycles = totalCycles - 1;
      }
      // For every cycle where lastGathered matches, we reduce the cycle
      else if (lastGathered === elementList.length) {
        cycles -= 1;
      }
      else {
        throw new Error('invalid path');
      }

      // Result
      if (typeof expected === 'undefined') {
        if (cycles === 0) {
          return elementList;
        }
        return false;
      }
      if (cycles === 0 && expected <= elementList.length) {
        return elementList;
      }
      return false;
    });
  }

  protected async getElementsWithoutWait(): Promise<WebElement[]> {
    let elementList: WebElement[] | null = null;

    const chain = [...this.lazyChain];

    async function getNextList(next: Node, elementList: WebElement[] | null) {
      const nextList: WebElement[] = [];
      if (elementList === null) {
        // First occurance
        const elements = await next.seleniumElement.findElements();
        nextList.push(...elements);
      }
      else {
        const nestedElements = await Promise.all(elementList.map((el) => {
          return next.seleniumElement.findFromWebElement(el);
        }));
        const elements = nestedElements.length
          ? nestedElements.reduce((a, b) => { return [...a, ...b]; })
          : [];
        nextList.push(...elements);
      }

      return nextList;
    }

    for (const next of chain) {
      elementList = await getNextList(next, elementList);
    }

    if (elementList === null) {
      throw new Error('invalid elementList, lazyChain must have at least one element');
    }

    return elementList;
  }

  protected waitForAttributeComparison(
    attribute: string,
    compareValue: string,
    comparison: boolean,
  ) {
    const message = `
      waiting for

      ${this}

      to have attribute ${attribute} ${comparison ? 'equal' : 'not equal'} to ${compareValue}
    `;
    return this.waitFor<true>(message, async () => {
      const [first] = await this.getElementsWithoutWait();
      if (!first) { return false; }
      const value = await first.getAttribute(attribute);
      if (comparison && value !== compareValue) { return false; }
      if (!comparison && value === compareValue) { return false; }
      return true;
    });
  }

  protected waitForHasClass(className: string) {
    const message = `
    waiting for

    ${this}

    to have class "${className}"
    `;
    return this.waitFor<true>(message, async () => {
      return this.hasClass(className);
    });
  }

  /**
   * Sleep for x milliseconds
   *
   * In MOST cases, there is a better way than sleeping. Avoid using this
   * at all costs, as sleeping is generally unreliable and leads to a brittle
   * test suite
   */
  protected async sleep(milli: number) {
    await this.driver.sleep(milli);
  }

  protected waitFor<T>(message: string, fn: (this: Node) => Promise<T | false>) {
    const { waitTime: timeout } = getConfig();
    const condition = new Condition<T>(message, fn);
    return Promise.resolve(this.driver.wait(condition, timeout));
  }

  protected async switchToFrame(id: string) {
    await this.driver.switchTo().frame(id as any);
    return async () => {
      await this.driver.switchTo().defaultContent();
    };
  }

  private static exists(target?: Node): target is Node  {
    return Boolean(target);
  }
}
