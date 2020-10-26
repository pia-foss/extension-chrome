import { Context, createContext } from './context';

type TestFunction = (this: Context) => Promise<void>;

/**
 * Injected test suite
 *
 * Injects the selenium test context
 *
 * @param message - description of test case
 * @param fn - test function
 */
function iit(message: string, fn?: TestFunction, only = false) {
  const testFn = only ? it.only : it;
  if (fn) {
    testFn(message, async function () {
      // tslint:disable-next-line:no-this-assignment
      const mochaContext = this;
      const context = createContext(mochaContext);

      return fn.call(context);
    });
  }
  else {
    testFn(message);
  }
}

export { iit };
