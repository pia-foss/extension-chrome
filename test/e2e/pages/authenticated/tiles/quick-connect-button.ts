import { Button, Image } from '../../../elements';
import { Node, ElementDescriptor, createSelector } from '../../../core';

class QuickConnectButton extends Button {
  private readonly image: Image;

  public constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.image = new Image(
      {
        selector: createSelector({
          value: '.flag',
        }),
        name: 'quick connect flag',
      },
      this,
    );
  }

  public async connect() {
    const connected = await this.isConnected();
    if (!connected) {
      await this.toggle();
    }
  }

  public async getRegion() {
    const el = await this.image;
    return await el.getAttribute('data-region-id');
  }

  private async isConnected(): Promise<boolean> {
    return this.hasClass('connected');
  }

  private async toggle() {
    await this.click();
  }
}

export { QuickConnectButton };
