const TIMED_OUT = Symbol('timed out');

/**
 * Schedule a promise to reject after "time" ms
 *
 * @param {number} time timeout before rejecting promise
 */
function wait(time) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(TIMED_OUT);
    }, time);
  });
}

/**
 * Add a timeout to a promise
 *
 * The resulting promise will reject if the timeout expires before
 * the given promise resolves/rejects
 *
 * @template T
 *
 * @param {Promise<T>} promise Given promise
 * @param {number} timeout Amount of time
 *
 * @returns {Promise<T>} wrapped promise
 */
function addTimeout(promise, timeout) {
  return Promise.race([
    promise,
    wait(timeout),
  ]);
}

/**
 * Get a result from a request, be it with or without a timeout
 *
 * @param {Promise<Response>} request The pending result of fetch request
 * @param {number} [timeout] Possible timeout on request
 *
 * @throws {Response} if response is not ok
 * @throws {Symbol} if timeout expires
 * @throws {Error} if generic error occurs
 */
async function getResult(request, timeout) {
  let result;
  if (timeout > 0) {
    result = await addTimeout(request, timeout);
  }
  else {
    result = await request;
  }
  if (!result.ok) {
    throw result;
  }
  return result;
}

/**
 * Augment the provided error with cause and ok
 *
 * NOTE: Will fail to augment cyclic errors
 */
function augmentError(error, cause) {
  try {
    return Object.assign(error, {
      cause,
    });
  }
  catch (_) {
    return Object.assign(
      JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
      { cause },
    );
  }
}

/**
 * Add a cause to failed requests
 *
 * @param {Error|Response|Symbol} err thrown error from fetch request
 */
function addCause(err) {
  let errWithCause;
  if (err === TIMED_OUT) {
    errWithCause = augmentError(new Error('timeout occurred'), 'timeout');
  }
  else if (err.ok === false) {
    errWithCause = augmentError(err, 'status');
  }
  else if (!window.navigator.onLine) {
    errWithCause = augmentError(err, 'offline');
  }
  else {
    errWithCause = augmentError(err, 'error');
  }

  return errWithCause;
}

/**
 * Get opts for fetch, allowing each method to have
 * unique defaults, and assigning logical defaults
 * if no other value is provided
 *
 * Logical defaults are currently based on Chrome's
 * default values
 *
 * @param {*} methodOpts Opts defined for method
 * @param {*} clientOpts Opts defined by user
 */
function getOpts(methodOpts, clientOpts) {
  const { method } = methodOpts;
  if (!method) {
    throw new Error('methodOpts must contain method');
  }
  const mode = clientOpts.mode || methodOpts.mode;
  const credentials = clientOpts.credentials || methodOpts.credentials;
  const cache = clientOpts.cache || methodOpts.cache || 'default';
  const redirect = clientOpts.redirect || methodOpts.redirect || 'follow';
  const referrer = clientOpts.referrer || methodOpts.referrer || 'client';
  const integrity = clientOpts.integrity || methodOpts.integrity;
  const defaultHeaders = methodOpts.headers || {};
  const clientHeaders = clientOpts.headers || {};
  const headers = Object.assign({}, defaultHeaders, clientHeaders);
  const { body } = clientOpts;

  return {
    mode,
    body,
    credentials,
    cache,
    redirect,
    referrer,
    integrity,
    headers,
    method,
  };
}

/**
 * Create a http request method utilizing native fetch api
 *
 * @param {*} methodOpts Optionally set logical defaults for the method
 */
function createMethod(methodOpts = {}) {
  return async (url, clientOpts = {}) => {
    if (!url) {
      throw new Error('must provide url for http requests');
    }
    // extract timeout (not native fetch opt)
    const { timeout } = clientOpts;
    const opts = getOpts(methodOpts, clientOpts);
    const request = fetch(url, opts);
    try {
      // Await is important here in order to catch rejected promise
      return await getResult(request, timeout);
    }
    catch (err) {
      throw addCause(err);
    }
  };
}

/**
 * Utility for making http requests
 */
const http = {
  get: createMethod({ method: 'GET' }),
  head: createMethod({ method: 'HEAD' }),
  post: createMethod({ method: 'POST' }),
};

export default http;
