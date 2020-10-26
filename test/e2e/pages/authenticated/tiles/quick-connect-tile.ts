import { Node, ElementDescriptor } from '../../../core';
import { createSelector } from '../../../core/entities/selector';
import { Tile } from './tile';
import { QuickConnectButton } from './quick-connect-button';

class QuickConnectTile extends Tile {
  public readonly firstRegion: QuickConnectButton;

  public constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.firstRegion = new QuickConnectButton(
      {
        selector: createSelector({
          value: '.connect-region',
        }),
        name: 'QuickConnect Region',
      },
      this,
    );
  }

  public async expectRegionsCount(count: number) {
    await this.firstRegion.expectCount(count);
  }
}

export { QuickConnectTile };
