/**
 * report an error if debug mode enabled
 *
 * @param {string} name context for error
 * @param {Error} err error
 */
function reportError(...args) {
  const [name] = args;
  const act = (err) => {
    let errorMessage;
    if (typeof err === 'string') {
      errorMessage = err;
    }
    else {
      errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
    }

    debug(`${name}: ${errorMessage}`);
  };
  if (args.length > 1) {
    const err = args[1];
    return act(err);
  }
  return act;
}

export default reportError;
