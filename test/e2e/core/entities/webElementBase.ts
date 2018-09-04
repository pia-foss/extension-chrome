import { ElementDescriptor, LazyWebElement } from './lazyWebElement';
import { DriverFactory } from '../driver';
import { Actions, createActions } from './actions';
import { getConfig } from '../util/config';
import { WebElementCondition } from 'selenium-webdriver';

/**
 * Used to provide useful functionality to user defined Elements
 */
export abstract class WebElementBase {
  private seleniumElement: LazyWebElement;
  private readonly parent?: WebElementBase;
  public readonly name: string;

  constructor(descriptor: ElementDescriptor, parent?: WebElementBase) {
    this.seleniumElement = new LazyWebElement(descriptor);
    this.parent = parent;
    this.name = descriptor.name;
  }

  private get lazyChain() {
    // tslint:disable-next-line:no-this-assignment
    let target: WebElementBase = this;
    let chain = [target];
    while (WebElementBase.exists(target.parent)) {
      target = target.parent;
      chain = [target, ...chain];
    }

    return chain;
  }

  private get driver() {
    return DriverFactory.getDriver();
  }

  protected get element() {
    const { WAIT_TIME } = getConfig();
    const message = `
      for element:

      ${this}

      to exist
    `;
    const condition = new WebElementCondition(message, async () => {
      const [first, ...rest] = this.lazyChain;
      let [target] = await first.seleniumElement.findElements();
      for (const next of rest) {
        if (!target) {
          return false;
        }
        const elements = await next.seleniumElement.findFromWebElement(target);
        ([target] = elements);
      }

      return target;
    });

    return this.driver.wait(condition, WAIT_TIME);
  }

  protected get visibleElement() {
    const { WAIT_TIME } = getConfig();
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

    return this.driver.wait(condition, WAIT_TIME);
  }

  protected get actions(): Actions {
    return createActions(DriverFactory.getDriver());
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

  public async moveTo({ x, y, duration }: { x?: number, y?: number, duration?: number }) {
    const element = await this.visibleElement;
    await this.actions.move({ x, y, duration, origin: element }).perform();
  }

  public async waitForVisible() {
    await this.seleniumElement.waitAndFindVisibleElement();
  }

  public async waitExtraForVisible() {
    await this.seleniumElement.waitAndFindVisibleElement(2);
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

  private static exists(target?: WebElementBase): target is WebElementBase  {
    return Boolean(target);
  }
}
