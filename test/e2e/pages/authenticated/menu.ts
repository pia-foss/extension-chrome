import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button } from '../../elements';

class AuthenticatedMenu extends PageObject {
  public settings: Button;
  public account: Button;
  public help: Button;
  public logout: Button;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.external-buttons',
        }),
        name: 'authenticated menu',
      },
      parent,
    );
    this.settings = new Button(
      {
        selector: createSelector({
          value: '.settings-icon',
        }),
        name: 'settings',
      },
      this,
    );
    this.account = new Button(
      {
        selector: createSelector({
          value: '.btn-account',
        }),
        name: 'account',
      },
      this,
    );
    this.help = new Button(
      {
        selector: createSelector({
          value: '.btn-help',
        }),
        name: 'help',
      },
      this,
    );
    this.logout = new Button(
      {
        selector: createSelector({
          value: '.btn-logout',
        }),
        name: 'logout',
      },
      this,
    );
  }
}

export { AuthenticatedMenu };
