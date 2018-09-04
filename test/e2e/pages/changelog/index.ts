import { PageObject, createSelector } from '../../core';

class ChangelogPage extends PageObject {
  constructor() {
    super({
      selector: createSelector({
        value: '#changelog-template',
      }),
      name: 'ChangelogPage',
    });
  }
}

export { ChangelogPage };
