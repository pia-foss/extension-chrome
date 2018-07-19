export default function(app) {
  const basename = (filename) => {
    return filename.split("/").slice(-1);
  };

  return (e) => {
    const {filename, lineno, message} = e;
    try { app.logger.debug(`javascript error at ${basename(filename)}:${lineno}: ${message}`); }
    /**
     * NOTE: This will catch any 'dead object' asynchronous bugs while the view is hanging.
     * The best action would be to kill the window at this point since the view itself is
     * no longer usable. Reopening the window should solve any issues at this point.
     * Originated in Firefox, Ported to Chrome. May not be of any use here though.
     */
    catch (err) { window.close(); }
  };
}
