/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function initOnAlarm(app) {
  return function onAlarm(alarm) {
    switch (alarm.name) {
      case 'PollRegionList':
        app.util.regionlist.sync()
          .then(() => {
            debug('onalarm.js: completed background poll of regions');
          })
          .catch((res) => {
            debug(`onalarm.js: background poll of regions failed (${res.cause})`);
          });
        break;

      default:
        break;
    }
  };
}

export default createApplyListener((app, addListener) => {
  addListener(app.util.httpsUpgrade.onAlarm);
  addListener(initOnAlarm(app));
});
