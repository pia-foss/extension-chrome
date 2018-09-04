import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Container } from '../../elements';

class RobotsPage extends PageObject {
  container: Container;

  constructor() {
    super({
      selector: createSelector({
        value: 'body',
      }),
      name: 'robots.txt page',
    });
    this.container = new Container(
      {
        selector: createSelector({
          value: 'body > pre',
        }),
        name: 'robots.txt container',
      },
      this,
    );

    this.url = 'https://www.privateinternetaccess.com/robots.txt';
  }
}

export { RobotsPage };
