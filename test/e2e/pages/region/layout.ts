import { PageObject } from '../../core';
import { Button } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class RegionLayout extends PageObject {
  public listIcon: Button;
  public gridIcon: Button;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '#toggle-icon',
        }),
        name: 'selector',
      },
      parent,
    );
    this.listIcon = new Button(
      {
        selector: createSelector({
          value: '#list-icon',
        }),
        name: 'listIcon',
      },
      this,
    );
    this.gridIcon = new Button(
      {
        selector: createSelector({
          value: '#grid-icon',
        }),
        name: 'gridIcon',
      },
      this,
    );
  }
}

export { RegionLayout };
