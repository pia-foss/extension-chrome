import { Node } from '../core';
import { ElementDescriptor } from '../core/entities/lazyWebElement';
import { Option } from './option';

class Select extends Node {
  private readonly options: Option[];

  constructor(
    descriptor: ElementDescriptor,
    parent: Node,
    ...optionsIds: string[]
  ) {
    super(descriptor, parent);
    this.options = optionsIds.map((id) => {
      return new Option(id, this);
    });
  }

  async selectOption(id: string): Promise<void> {
    const option = this.options.find((option) => {
      return option.getId() === id;
    });
    if (!option) {
      throw new Error(`no option exists with id: ${id}`);
    }

    await option.click();
  }

  async getActive(): Promise<string> {
    const optionStatus = await Promise.all(this.options.map((option) => {
      return option.isActive();
    }));
    const firstActive = optionStatus.indexOf(true);
    if (firstActive === -1) {
      throw new Error('no active option');
    }

    return this.options[firstActive].getId();
  }
}

export { Select };
