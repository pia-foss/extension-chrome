import createLocalStorage from '@mocks/localStorage';

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: createLocalStorage(),
  });
});
