import { WebElementBase } from '../core';

class Image extends WebElementBase {
  public async click() {
    return (await this.visibleElement).click();
  }
}

export { Image };
