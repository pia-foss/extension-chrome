import { WebElementBase } from '../core';

class Link extends WebElementBase {
  public async click() {
    const el = await this.element;

    return el.click();
  }
}

export { Link };
