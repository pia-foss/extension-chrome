import { config as loadConfig } from 'dotenv';

import { isNothing } from './isNothing';

type Key
  = NumberKey;

type NumberKey
  = 'WAIT_TIME';

type NumConfig = {
  [key in NumberKey]: number;
};

export type Config = NumConfig;

let cache: Config | null = null;

loadConfig();

function errorOut(errorMsg: string) {
  throw new Error(`
    There may be a problem with your config file (.env).

    Please see the file

      '/.env.example'

    at the root of the project to see how to configure the e2e test suite.

    You must create a

      '/.env'

    if you have not already.

    Current error: ${errorMsg}
  `);
}

function getKey(key: Key, cast: NumberConstructor | StringConstructor) {
  const value = process.env[key];
  if (isNothing(value)) {
    return errorOut(`no value was found for the key "${key}"`);
  }
  try {
    return cast(value);
  }
  catch {
    return errorOut(`the key "${key}" could not be cast to a ${cast.name}`);
  }
}

function getNumKey(key: NumberKey) {
  return getKey(key, Number) as number;
}

export function getConfig(): Config {
  const config = cache || {
    WAIT_TIME: getNumKey('WAIT_TIME'),
  };
  cache = config;

  return cache;
}
