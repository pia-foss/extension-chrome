import {
  Node,
  ElementDescriptor,
  createSelector,
} from '../../../core';
import { Button } from '../../../elements';

class Tile extends Node {
  private bookmarkButton: Button;

  constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.bookmarkButton = new Button(
      {
        selector: createSelector({
          value: '.save-flag',
        }),
        name: `${this.name} bookmark`,
      },
      this,
    );
  }

  public async bookmark() {
    const enabled = await this.getBookmarkValue();
    if (!enabled) {
      await this.toggleBookmark();
    }
  }

  public async removeBookmark() {
    const enabled = await this.getBookmarkValue();
    if (enabled) {
      await this.toggleBookmark();
    }
  }

  public async isInDrawer(): Promise<boolean> {
    const inDrawer = await this.hasClass('drawer-tile');
    return inDrawer;
  }

  public async getClassnames(count?: number): Promise<string[]> {
    const elements = await this.getElements(count);
    const classNames = await Promise.all(elements.map((el) => {
      return el.getAttribute('class');
    }));
    return classNames;
  }

  private async toggleBookmark() {
    await this.bookmarkButton.click();
  }

  private async getBookmarkValue(): Promise<boolean> {
    return await this.hasClass('saved');
  }
}

export { Tile };
