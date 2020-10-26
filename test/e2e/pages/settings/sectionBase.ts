import { PageObject, ElementDescriptor } from '../../core';
import { Button, Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

abstract class SectionBase extends PageObject {
  protected header: Button;

  constructor(desc: ElementDescriptor, parent: PageObject) {
    super(desc, parent);

    this.header = new Button(
      {
        selector: createSelector({
          value: '.section-header',
        }),
        name: 'header',
      },
      this,
    );
  }

  public expand(): Promise<void> {
    return this.header.click();
  }

  public getSetting(settingName: string): Checkbox {
    const setting = (this as any)[settingName];
    if (!setting) {
      throw new Error(`no such setting: ${settingName}`);
    }
    if (!(setting instanceof Checkbox)) {
      throw new Error(`${settingName} is not a setting`);
    }
    return setting;
  }
}

export { SectionBase };
