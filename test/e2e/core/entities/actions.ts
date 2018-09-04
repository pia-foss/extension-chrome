import * as S from 'selenium-webdriver';

import { Driver } from '../driver';

/*
  The current version of @types/selenium-webdriver does not have valid types
  for the {actions} implementation, here is a limited typing for the current
  actions.
 */

 /** Cannot be used in Chrome (not supported), here for consistency w/ firefox */
type Origin = { _indicator: 'do not use me' };

interface HasOrigin {
  Origin: Origin;
}

interface ActionDriver {
  actions: DriverCreateActions;
}

interface MoveOpts {
  duration?: number;
  origin?: S.WebElement;
  x?: number;
  y?: number;
}

interface Actions {
  move(opts: MoveOpts): Actions;
  perform(): Promise<undefined>;
}

interface CreateOpts {
  async: boolean;
  bridge: boolean;
}

type DriverCreateActions = (opts: CreateOpts) => Actions;

function createActions(driver: Driver) {
  const hackDriver = driver as any as ActionDriver;

  return hackDriver.actions({
    async: false,
    bridge: true,
  });
}

/**
 * Hack because current selenium typings are a version behind
 */
function getOrigin() {
  const { Origin } = (S as any as HasOrigin);

  return Origin;
}

export { Actions, getOrigin, createActions };
