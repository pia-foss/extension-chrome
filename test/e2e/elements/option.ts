import { WebElementBase, createSelector } from '../core';

class Option extends WebElementBase {
  private readonly id: string;

  constructor(id: string, parent: WebElementBase) {
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
    const className = await this.element.getAttribute('class');
    return className.includes('active');
  }

  getId() {
    return this.id;
  }

  async click() {
    await this.visibleElement.click();
  }
}

export { Option };
