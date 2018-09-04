import { WebElementBase } from '../core/entities/webElementBase';

class Button extends WebElementBase {
  public async getLabel() {
    const el = await this.element;

    return el.getText();
  }

  public async click() {
    // A button cannot clikc a hidden element, hence we wait for the element
    // to be visible
    const el = await this.visibleElement;

    return el.click();
  }
}

export { Button };
