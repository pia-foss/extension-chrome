import { WebElementBase } from '../core';

class Text extends WebElementBase {
  // TODO: Intercept name & add text

  public async getText() {
    const el = await this.element;

    return el.getText();
  }
}

export { Text };
