function construct(path) {
  const Constructor = jest.requireMock(path).default;
  return new Constructor();
}

function createMockApp() {
  const app = {};

  // proxy
  const proxy = construct('@chromesettings/proxy');
  proxy.mockValues = {
    enabled: false,
  };
  proxy.getEnabled.mockImplementation(() => {
    return app.proxy.mockValues.enabled;
  });
  app.proxy = proxy;

  // util
  app.util = {};
  // httpsUpgrade
  app.util.httpsUpgrade = construct('@util/https-upgrade');
  // storage
  const storage = construct('@util/storage');
  storage.mockValues = {
    getItem: new Map(),
  };
  storage.getItem.mockImplementation((key) => {
    return storage.mockValues.getItem.get(key);
  });
  app.util.storage = storage;
  // settings
  const settings = construct('@util/settings');
  settings.mockValues = {
    getItem: new Map(),
    isActive: new Map(),
  };
  settings.getItem.mockImplementation((key) => {
    return settings.mockValues.getItem.get(key);
  });
  settings.isActive.mockImplementation((key) => {
    return settings.mockValues.isActive.get(key);
  });
  app.util.settings = settings;

  return app;
}

export default createMockApp;
