import { expect } from 'chai';

import { WebElementBase } from '../core';

class Checkbox extends WebElementBase {

  private async getChecked() {
    const el = await this.element;
    return el.isSelected();
  }

  public async toggle() {
    const el = await this.element;

    return el.click();
  }

  public async check() {
    const checked = await this.getChecked();
    if (!checked) {
      return this.toggle();
    }
  }

  public async uncheck() {
    const checked = await this.getChecked();
    if (checked) {
      return this.toggle();
    }
  }

  public async expectChecked() {
    const checked = await this.getChecked();
    expect(checked, `expected ${this} to be checked`).to.be.true;
  }

  public async expectNotChecked() {
    const checked = await this.getChecked();
    expect(checked, `expected ${this} to not be checked`).to.be.false;
  }
}

export { Checkbox };
