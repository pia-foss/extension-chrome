import { Context as MochaContext } from 'mocha';
import { Windows } from '../entities/windows';
import { DriverFactory } from '../driver';
import { Script } from '..';

interface Context extends MochaContext {
  windows: Windows;
  script: Script;
}

function createContext(mochaContext: MochaContext): Context {
  const driver = DriverFactory.getDriver();
  return Object.assign({}, mochaContext, {
    windows: new Windows(driver),
    script: new Script(driver),
    driver: driver as any as undefined,
  });
}

export { Context, createContext };
