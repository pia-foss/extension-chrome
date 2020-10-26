import { Node } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button, Container } from '../../elements';

class AuthenticatedMenu extends Node {
  public settings: Button;
  public account: Button;
  public help: Button;
  public logout: Button;
  public switch: Button;
  public dropdown: Container;

  constructor(parent: Node) {
    super(
      {
        selector: createSelector({
          value: '.more-links-container',
        }),
        name: 'more-links-container',
      },
      parent,
    );
    this.switch = new Button(
      {
        selector: createSelector({
          value: '.more-links-target',
        }),
        name: 'more-links-target',
      },
      this,
    );
    this.dropdown = new Container(
      {
        selector: createSelector({
          value: '.more-links-dropdown',
        }),
        name: 'more-links-dropdown',
      },
      this,
    );
    this.settings = new Button(
      {
        selector: createSelector({
          value: '.more-links-dropdown ul li:first-child div',
        }),
        name: 'settings',
      },
      this.dropdown,
    );
    this.account = new Button(
      {
        selector: createSelector({
          value: '.more-links-dropdown ul li:nth-child(2) div',
        }),
        name: 'account',
      },
      this.dropdown,
    );
    this.help = new Button(
      {
        selector: createSelector({
          value: '.more-links-dropdown ul li:nth-child(3) div',
        }),
        name: 'help',
      },
      this.dropdown,
    );
    this.logout = new Button(
      {
        selector: createSelector({
          value: '.more-links-dropdown ul li:nth-child(4) div',
        }),
        name: 'logout',
      },
      this.dropdown,
    );
  }

  public async toggleDropdown() {
    await this.switch.click();
    await this.dropdown.waitForVisible();
  }
}

export { AuthenticatedMenu };
