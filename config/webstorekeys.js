module.exports = {
  keys: {
    clientId: process.env.WEBSTORE_CLIENT_ID, // eslint-disable-line no-process-env
    clientSecret: process.env.WEBSTORE_CLIENT_SECRET, // eslint-disable-line no-process-env
    refreshToken: process.env.WEBSTORE_REFRESH_TOKEN, // eslint-disable-line no-process-env
  },
  ids: {
    public: process.env.WEBSTORE_PUBLIC_ID, // eslint-disable-line no-process-env
    internal: process.env.WEBSTORE_INTERNAL_ID // eslint-disable-line no-process-env
  }
}
