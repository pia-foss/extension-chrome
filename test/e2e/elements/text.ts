import { Node } from '../core';

class Text extends Node {
  public async getText() {
    const el = await this.element;

    return el.getText();
  }

  public async waitForTextEqual(text: string) {
    const message = `
      waiting for

        ${this}

      to have text not equal "${text}"
    `;
    return this.waitFor<true>(message, async () => {
      const [element] = await this.getElementsWithoutWait();
      if (!element) { return false; }
      const actual = await element.getText();
      return text === actual;
    });
  }

  public async waitForTextNotEqual(text: string) {
    const message = `
      waiting for

        ${this}

      to have text not equal "${text}"
    `;
    return this.waitFor<true>(message, async () => {
      const [element] = await this.getElementsWithoutWait();
      if (!element) { return false; }
      const actual = await element.getText();
      return text !== actual;
    });
  }
}

export { Text };
