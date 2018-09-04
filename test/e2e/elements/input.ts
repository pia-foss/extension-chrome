import { WebElementBase } from '../core/entities/webElementBase';
import { Key } from 'selenium-webdriver';
import { expect } from 'chai';

class Input extends WebElementBase {
  // TODO: Override constructor to add to name

  public async getValue() {
    const el = await this.element;

    return el.getAttribute('value');
  }

  async setValue(value: string) {
    const el = await this.element;
    await el.sendKeys(Key.chord(Key.CONTROL, 'A'));
    await el.sendKeys(Key.BACK_SPACE);
    await el.sendKeys(value);
  }

  async hasPlaceholder(expected: string) {
    const placeholder = await this.element.getAttribute('placeholder');
    expect(placeholder).to.eq(expected);
  }
}

export { Input };
