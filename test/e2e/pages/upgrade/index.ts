import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Image, Text } from '../../elements';

class BrowserUpgradePage extends PageObject {
  public warningIcon: Image;
  public warningText: Text;

  constructor() {
    super({
      selector: createSelector({
        value: 'body',
      }),
      name: 'browser upgrade page',
    });
    this.warningIcon = new Image(
      {
        selector: createSelector({
          value: '.warningicon',
        }),
        name: 'warningIcon',
      },
      this,
    );
    this.warningText = new Text(
      {
        selector: createSelector({
          value: '.warningtext',
        }),
        name: 'warningText',
      },
      this,
    );
  }
}

export { BrowserUpgradePage };
