export default function (app) {
  const basename = (filename) => {
    return filename.split('/').slice(-1);
  };

  return (e) => {
    const { filename, lineno, message } = e;
    // NOTE: This will catch any 'dead object' asynchronous bugs while the view is hanging.
    try { app.logger.debug(`javascript error at ${basename(filename)}:${lineno}: ${message}`); }
    catch (err) { console.log(err); }
  };
}
