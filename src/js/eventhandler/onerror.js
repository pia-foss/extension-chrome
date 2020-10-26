/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function onError(app) {
  const basename = (filename) => {
    return filename.split('/').slice(-1);
  };

  return (e) => {
    const { filename, lineno, message } = e;
    // NOTE: This will catch any 'dead object' asynchronous bugs while the view is hanging.
    try { app.logger.debug(`javascript error at ${basename(filename)}:${lineno}: ${message}`); }
    catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };
}

export default createApplyListener((app, addListener) => {
  addListener(onError(app));
});
