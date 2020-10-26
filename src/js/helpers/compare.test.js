import * as compare from '@helpers/compare';

describe('@helpers > compare', () => {
  describe('#byLatency', () => {
    [
      {
        name: 'presorted',
        input: [1, 2, 3],
        expected: [1, 2, 3],
      },
      {
        name: 'reverse sorted',
        input: [4, 3, 1],
        expected: [1, 3, 4],
      },
      {
        name: 'duplicates',
        input: [1, 1, 1],
        expected: [1, 1, 1],
      },
      {
        name: 'random',
        input: [5, 300, 0, 3, 99, 125],
        expected: [0, 3, 5, 99, 125, 300],
      },
      {
        name: 'some errors',
        input: [5, 'ERROR', 300, 0, 3, 99, 125, 'ERROR'],
        expected: [0, 3, 5, 99, 125, 300, 'ERROR', 'ERROR'],
      },
      {
        name: 'mixed errors & pending',
        input: ['PENDING', 5, 'ERROR', 300, 'PENDING', 0, 3, 99, 125, 'ERROR'],
        expected: [0, 3, 5, 99, 125, 300, 'PENDING', 'PENDING', 'ERROR', 'ERROR'],
      },
      {
        name: 'negative & positive values',
        input: [-5, 55, 3, -60, -5, 99],
        expected: [3, 55, 99, -5, -60, -5],
      },
      {
        name: 'negative, positive, error, pending',
        input: [89, 'ERROR', 'PENDING', 'ERROR', -55, 2, 99, 'ERROR'],
        expected: [2, 89, 99, 'PENDING', 'ERROR', 'ERROR', 'ERROR', -55],
      },
    ].forEach(({ name, input, expected }) => {
      test(`"${name}" list should be sorted correctly`, () => {
        const actual = [...input].sort(compare.byLatency);

        expect(actual).toEqual(expected);
      });
    });
  });
});
