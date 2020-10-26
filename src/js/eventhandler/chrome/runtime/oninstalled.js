import createApplyListener from '@helpers/applyListener';

function newVersionNotification(app) {
  const isNewVersion = (newVersionStr, oldVersionStr) => {
    // TODO: potentially flawed (increase in # of digits doesn't necessarily mean a higher version)
    const oldVersion = parseInt(oldVersionStr.replace(/\./g, ''));
    const newVersion = parseInt(newVersionStr.replace(/\./g, ''));
    return newVersion > oldVersion;
  };

  const notify = async (details) => {
    await app.util.i18n.getWorker();
    const { contentsettings } = app;
    const title = t('ExtensionUpdated');
    const body = t('WelcomeToNewVersion');
    if (isNewVersion(app.buildinfo.version, details.previousVersion)) {
      contentsettings.extensionNotification.create(title, { body });
    }
  };

  return (details) => {
    if (details.reason === 'update') {
      notify(details);
    }
  };
}

export default createApplyListener((app, addListener) => {
  addListener(newVersionNotification(app));
});
