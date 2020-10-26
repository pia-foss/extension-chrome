import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button } from '../../elements';

class RegionTabs extends PageObject {
  public nameSort: Button;
  public latencySort: Button;
  public favoritesSort: Button;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.region-sort-selection',
        }),
        name: 'region sort tabs',
      },
      parent,
    );
    this.nameSort = new Button(
      {
        selector: createSelector({
          value: '.name',
        }),
        name: 'nameSort',
      },
      this,
    );
    this.latencySort = new Button(
      {
        selector: createSelector({
          value: '.latency',
        }),
        name: 'latencySort',
      },
      this,
    );
    this.favoritesSort = new Button(
      {
        selector: createSelector({
          value: '.favorites',
        }),
        name: 'favoritesSort',
      },
      this,
    );
  }
}

export { RegionTabs };
