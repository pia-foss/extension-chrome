import createChrome from '@mocks/chrome';

beforeEach(() => {
  window.chrome = createChrome();
  window.browser = window.chrome;
});
