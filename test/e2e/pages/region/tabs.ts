import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button } from '../../elements';

class RegionTabs extends PageObject {
  public all: Button;
  public favorites: Button;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.favorite-region-selector',
        }),
        name: 'region tabs',
      },
      parent,
    );
    this.all = new Button(
      {
        selector: createSelector({
          value: '.all',
        }),
        name: 'all',
      },
      this,
    );
    this.favorites = new Button(
      {
        selector: createSelector({
          value: '.favorites',
        }),
        name: 'favorites',
      },
      this,
    );
  }
}

export { RegionTabs };
