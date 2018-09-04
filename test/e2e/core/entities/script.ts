import { Driver } from '../driver';

type AsyncScriptFunction<P, R> = (payload: P, callback: ScriptCallback<R>) => void;
type ScriptCallback<R> = (result: R) => void;

class Script {
  private driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  public execute<P, R>(fn: (payload: P) => R, payload: P): Promise<R> {
    return Promise.resolve(this.driver.executeScript(fn, payload));
  }

  public executeAsync<P, R>(
    fn: AsyncScriptFunction<P, R>,
    payload: P,
  ): Promise<R> {
    return Promise.resolve(this.driver.executeAsyncScript(fn, payload));
  }
}

export { Script };
