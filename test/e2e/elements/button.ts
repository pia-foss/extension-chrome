import { Node } from '../core';

class Button extends Node {
  public async getLabel() {
    const el = await this.element;

    return el.getText();
  }

  public async click() {
    // A button cannot click a hidden element, hence we wait for the element
    // to be visible
    const el = await this.visibleElement;

    return el.click();
  }
}

export { Button };
