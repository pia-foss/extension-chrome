import { createContext, Context } from './context';

type BeforeEachFunction = (this: Context) => void;

function ibeforeEach(fn: BeforeEachFunction) {
  beforeEach(function () {
    // tslint:disable-next-line:no-this-assignment
    const mochaContext = this;
    const context = createContext(mochaContext);
    return fn.call(context);
  });
}

export { ibeforeEach };
