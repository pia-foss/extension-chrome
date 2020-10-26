import { Node } from '../core/entities/node';
import { Key } from 'selenium-webdriver';
import { expect } from 'chai';

class Input extends Node {
  public async getValue() {
    const el = await this.getElement();

    return el.getAttribute('value');
  }

  async setValue(value: string) {
    const el = await this.getElement();
    await el.sendKeys(Key.chord(Key.CONTROL, 'A'));
    await el.sendKeys(Key.BACK_SPACE);
    await el.sendKeys(value);
  }

  async hasPlaceholder(expected: string) {
    const element = await this.getElement();
    const placeholder = await element.getAttribute('placeholder');
    expect(placeholder).to.eq(expected);
  }
}

export { Input };
