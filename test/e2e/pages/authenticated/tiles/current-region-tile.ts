import { Node, ElementDescriptor, createSelector } from '../../../core';
import { Text, Image, Container } from '../../../elements';
import { Tile } from './tile';

class CurrentRegionTile extends Tile {
  public regionName: Text;
  public regionFlag: Image;
  public changeRegion: Container;

  constructor(descriptor: ElementDescriptor, node?: Node) {
    super(descriptor, node);
    this.regionName = new Text(
      {
        selector: createSelector({
          value: '.region-content .region-name .name',
        }),
        name: 'current region name',
      },
      this,
    );
    this.regionFlag = new Image(
      {
        selector: createSelector({
          value: '.region-content .flag',
        }),
        name: 'current region flag',
      },
      this,
    );
    this.changeRegion = new Container(
      {
        selector: createSelector({
          value: '.current-region',
        }),
        name: 'change current region',
      },
      this,
    );
  }

  public async waitForLatencyTest() {
    await this.changeRegion.waitExtraForVisible();
  }
}

export { CurrentRegionTile };
