import { config as loadConfig } from 'dotenv';

import { isNothing } from './isNothing';

export interface Config {
  waitTime: number;
}

let cache: Config | null = null;

loadConfig();

function errorOut(errorMsg: string) {
  return new Error(`
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

function getValue<V>(key: string, cast: (v: string) => V): V {
  const value = process.env[key];
  if (isNothing(value)) {
    throw errorOut(`no value was found for the key "${key}"`);
  }
  try {
    return cast(value);
  }
  catch {
    throw errorOut(`the key "${key}" could not be cast to a ${cast.name}`);
  }
}

function getNumValue(key: string) {
  return getValue(key, Number);
}

export function getConfig(): Config {
  const config = cache || {
    waitTime: getNumValue('WAIT_TIME'),
  };
  cache = config;

  return cache;
}
