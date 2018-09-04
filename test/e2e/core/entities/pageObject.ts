import { DriverFactory } from '../driver';
import { LazyWebElement, ElementDescriptor } from './lazyWebElement';
import { Actions, createActions } from './actions';
import { WebElementBase } from './webElementBase';

/**
 * PageObject Base Class
 *
 * Provides utilities for page objects extending this class
 *
 * If your selector relies on a parent for a unique selector, ensure you provide
 * a parent to your page object
 */
abstract class PageObject extends WebElementBase {
  private page: LazyWebElement;
  private overriddenUrl: string;

  constructor(page: ElementDescriptor, parent?: PageObject) {
    super(page, parent);
    this.page = new LazyWebElement(page);
    this.overriddenUrl = '';
  }

  private get pageDriver() {
    return DriverFactory.getDriver();
  }

  private get baseURL() {
    return this.pageDriver.baseURL;
  }

  protected get actions(): Actions {
    return createActions(this.pageDriver);
  }

  protected get url() {
    let url: string;
    if (this.overriddenUrl) {
      url = this.overriddenUrl;
    }
    else if (this.path()) {
      url = `${this.baseURL}/${this.path()}`;
    }
    else {
      throw new Error('please ensure either the "path" or "url" properties are set');
    }

    return url;
  }

  protected set url(value: string) {
    this.overriddenUrl = value;
  }

  public get expect() {
    return this.page.expect;
  }

  protected path() {
    return 'html/foreground.html';
  }

  /**
   * Sleep for x milliseconds
   *
   * In MOST cases, there is a better way than sleeping. Avoid using this
   * at all costs, as sleeping is generally unreliable and leads to a brittle
   * test suite
   */
  protected async sleep(milli: number) {
    await this.pageDriver.sleep(milli);
  }

  public getUrl() {
    return this.url;
  }

  public async navigate(fn?: (url: string) => string): Promise<string> {
    const url = fn ? fn(this.url) : this.url;
    await this.pageDriver.get(url);

    return url;
  }
}

export { PageObject };
