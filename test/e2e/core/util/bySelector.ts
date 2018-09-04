import { By } from 'selenium-webdriver';
import { Selector } from '../entities/selector';

export function bySelector(selector: Selector) {
  let by: typeof By.css | typeof By.xpath;
  switch (selector.type) {
    case 'css':
      by = By.css;
      break;

    case 'xpath':
      by = By.xpath;
      break;

    default:
      throw new Error(`invalid selector type: ${selector.type}`);
  }

  return by(selector.value);
}
