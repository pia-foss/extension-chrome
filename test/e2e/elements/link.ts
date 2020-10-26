import { Node } from '../core';

class Link extends Node {
  public async click() {
    const el = await this.element;

    return el.click();
  }

  public async getHref() {
    return (await this.element).getAttribute('href');
  }
}

export { Link };
