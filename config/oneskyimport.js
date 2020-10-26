module.exports = {
  options: {
    authFile: 'config/oneskyauthfile.json',
    projectId: process.env.ONESKY_PROJECT_ID, // eslint-disable-line no-process-env
    isKeepingAllStrings: false,
  },
  import: {
    options: {
      file: 'src/_locales/en/messages.json',
      fileFormat: 'HIERARCHICAL_JSON',
    },
  },
};
