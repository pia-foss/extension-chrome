import { PageObject, createSelector } from '../../core';

class ChangelogPage extends PageObject {
  constructor() {
    super({
      selector: createSelector({
        value: '#changelog-page',
      }),
      name: 'ChangelogPage',
    });
  }
}

export { ChangelogPage };
