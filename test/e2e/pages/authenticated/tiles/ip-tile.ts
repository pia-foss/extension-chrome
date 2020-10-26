import { Tile } from './tile';
import { Text } from '../../../elements';
import { Node, ElementDescriptor, createSelector } from '../../../core';

class IpTile extends Tile {
  public realIP: Text;
  public proxyIP: Text;

  public constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.realIP = new Text(
      {
        selector: createSelector({
          value: '.ip-section.real > .value',
        }),
        name: 'real ip',
      },
      this,
    );
    this.proxyIP = new Text(
      {
        selector: createSelector({
          value: '.ip-section.proxy > .value',
        }),
        name: 'proxy ip',
      },
      this,
    );
  }
}

export { IpTile }
