import { Tile } from './tile';
import { Button, Input } from '../../../elements';
import { createSelector, ElementDescriptor, Node } from '../../../core';

class BypassRulesTile extends Tile {
  public addButton: Button;
  public domainInput: Input;
  public removeButton: Button;

  public constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.addButton = new Button(
      {
        selector: createSelector({
          value: '.add-rule-btn',
        }),
        name: 'Add Button',
      },
      this,
    );
    this.domainInput = new Input(
      {
        selector: createSelector({
          value: '.add-rule-input',
        }),
        name: 'Domain Input',
      },
      this,
    );
    this.removeButton = new Button(
      {
        selector: createSelector({
          value: '.remove-rule',
        }),
        name: 'Remove Rule Button',
      },
      this,
    );
  }

  async removeButtonActive(): Promise<boolean> {
    return await this.removeButton.hasClass('active');
  }
}

export { BypassRulesTile };
