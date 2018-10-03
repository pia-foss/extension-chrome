export default function initOnAlarm(app) {
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
