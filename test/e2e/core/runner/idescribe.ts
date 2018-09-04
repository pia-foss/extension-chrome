type SuiteFunction = (this: Mocha.Suite) => void;

function idescribe(message: string, fn: SuiteFunction) {
  describe(message, function () {
    // tslint:disable-next-line:no-this-assignment
    const mochaSuiteContext = this;
    const suiteContext = mochaSuiteContext;
    return fn.call(suiteContext);
  });
}

export { idescribe };
