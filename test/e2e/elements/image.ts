import { Node } from '../core';

class Image extends Node {
  public async click() {
    return (await this.visibleElement).click();
  }

  public async getAlt() {
    return (await this.element).getAttribute('alt');
  }
}

export { Image };
