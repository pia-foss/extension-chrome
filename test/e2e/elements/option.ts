import { Node, createSelector } from '../core';

class Option extends Node {
  private readonly id: string;

  constructor(id: string, parent: Node) {
    super(
      {
        selector: createSelector({
          value: `#${id}`,
        }),
        name: id,
      },
      parent,
    );
    this.id = id;
  }

  async isActive(): Promise<boolean> {
    const element = await this.getElement();
    const className = await element.getAttribute('class');
    return className.includes('active');
  }

  getId() {
    return this.id;
  }

  async click() {
    const option = await this.element;
    await option.click();
  }
}

export { Option };
