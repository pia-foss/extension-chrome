import { PageObject, ElementDescriptor } from '../../core';
import { Button } from '../../elements';
import { createSelector } from '../../core/entities/selector';

abstract class SectionBase extends PageObject {
  protected header: Button;

  constructor(desc: ElementDescriptor, parent: PageObject) {
    super(desc, parent);

    this.header = new Button(
      {
        selector: createSelector({
          value: '.settingheader',
        }),
        name: 'header',
      },
      this,
    );
  }

  public expand(): Promise<void> {
    return this.header.click();
  }
}

export { SectionBase };
