import { Node } from '../core';

class Container extends Node {
  public async click() {
    const el = await this.element;
    return el.click();
  }
}

export { Container };
