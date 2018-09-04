type SelectorType = 'xpath' | 'css';

interface SelectorProps {
  readonly value: string;
  readonly type?: SelectorType;
}

interface Selector extends SelectorProps {
  toString(): string;
}

function createSelector({ value, type = 'css' }: SelectorProps): Selector {
  if (!value) {
    throw new Error('expected selector value');
  }
  return {
    value,
    type,
    toString() {
      return `${type.toUpperCase()} Selector -> ${value}`;
    },
  };
}

export { Selector, createSelector };
