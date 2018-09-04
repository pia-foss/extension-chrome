import { createSelector } from '../../core/entities/selector';
import { PageObject } from '../../core';
import { Button } from '../../elements';

class AuthenticatedRegion extends PageObject {
  public regionName: Button;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '#region',
        }),
        name: 'region section',
      },
      parent,
    );
    this.regionName = new Button(
      {
        selector: createSelector({
          value: '.name',
        }),
        name: 'region name',
      },
      this,
    );
  }
}

export { AuthenticatedRegion };
