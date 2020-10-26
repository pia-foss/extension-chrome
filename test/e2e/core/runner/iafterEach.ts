import { createContext, Context } from './context';

type AfterEachFunction = (this: Context) => void;

function iafterEach(fn: AfterEachFunction) {
  beforeEach(function () {
    // tslint:disable-next-line:no-this-assignment
    const mochaContext = this;
    const context = createContext(mochaContext);
    return fn.call(context);
  });
}

export { iafterEach };
