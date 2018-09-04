import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Checkbox, Text } from '../../elements';
import { AuthenticatedMenu } from './menu';
import { AuthenticatedRegion } from './region';

class AuthenticatedPage extends PageObject {
  private switch: Checkbox;
  public status: Text;
  public menu: AuthenticatedMenu;
  public region: AuthenticatedRegion;

  constructor() {
    super({
      selector: createSelector({
        value: '#authenticated-template',
      }),
      name: 'authenticated',
    });
    this.switch = new Checkbox(
      {
        selector: createSelector({
          value: 'input[type=checkbox].switch',
        }),
        name: 'switch',
      },
      this,
    );
    this.status = new Text(
      {
        selector: createSelector({
          value: '.status',
        }),
        name: 'status',
      },
      this,
    );
    this.menu = new AuthenticatedMenu(this);
    this.region = new AuthenticatedRegion(this);
  }

  private async waitForDebounce() {
    await this.sleep(500);
  }

  public async toggleSwitch() {
    await this.switch.toggle();
    await this.waitForDebounce();
  }

  public async switchOn() {
    await this.switch.check();
    await this.waitForDebounce();
  }

  public async switchOff() {
    await this.switch.uncheck();
    await this.waitForDebounce();
  }

  public async expectSwitchOn() {
    await this.switch.expectChecked();
  }

  public async expectSwitchOff() {
    await this.switch.expectNotChecked();
  }
}

export { AuthenticatedPage };
