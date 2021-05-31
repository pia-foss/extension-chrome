import checkBrowserVersion from '@helpers/checkBrowserVersion';

const { userAgent: DEFAULT_USER_AGENT } = window.navigator;

const Browser = {
  chrome: 'chrome',
  brave: 'brave',
  opera: 'opera',
  firefox: 'firefox'
};

const OS = {
  windows: 'win10',
  ubuntu: 'ubuntu',
  mac: 'macOS',
};

const UserAgentList = [
  {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3578.98 Safari/537.36',
    browser: Browser.chrome,
    os: OS.windows,
  },
  {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3626.109 Safari/537.36',
    browser: Browser.brave,
    os: OS.windows,
  },
  {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3578.98 Safari/537.36 OPR/58.0.3135.68',
    browser: Browser.opera,
    os: OS.windows,
  },
  {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3578.98 Safari/537.36',
    browser: Browser.chrome,
    os: OS.mac,
  },
  {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3626.109 Safari/537.36',
    browser: Browser.brave,
    os: OS.mac,
  },
  {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3578.98 Safari/537.36 OPR/58.0.3135.68',
    browser: Browser.opera,
    os: OS.mac,
  },
  {
    value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.98 Chrome/$version.0.3578.98 Safari/537.36',
    browser: Browser.chrome,
    os: OS.ubuntu,
  },
  {
    value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3626.109 Safari/537.36',
    browser: Browser.brave,
    os: OS.ubuntu,
  },
  {
    value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/$version.0.3578.98 Safari/537.36 OPR/58.0.3135.68',
    browser: Browser.opera,
    os: OS.ubuntu,
  },
  {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6; rv:65.0) Gecko/20100101 Firefox/$version.0',
    browser: Browser.firefox,
    os: OS.windows,
  },
  {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/$version.0',
    browser: Browser.firefox,
    os: OS.mac,
  },
  {
    value: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/$version.0',
    browser: Browser.firefox,
    os: OS.ubuntu,
  },
];

function getUserAgentFor({ browser, os, version }) {
  const userAgentEntry = UserAgentList.find((entry) => {
    return (entry.browser === browser && entry.os === os);
  });
  if (!userAgentEntry) {
    throw new Error(`Could not find user agent for (browser: ${browser}, os: ${os})`);
  }
  return userAgentEntry.value.replace('$version', version);
}

function setUserAgent(value) {
  const oldDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
  Object.defineProperty(window.navigator, 'userAgent', {
    value,
    configurable: true,
    writable: true,
  });
  return () => {
    if (oldDescriptor) {
      Object.defineProperty(window.navigator, 'userAgent', oldDescriptor);
    }
    else {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: DEFAULT_USER_AGENT,
        configurable: true,
        writable: true,
      });
    }
  };
}

describe('@helpers > checkBrowserVersion', () => {
  let cleanup;

  beforeEach(() => {
    cleanup = setUserAgent('');
  });

  afterEach(() => {
    cleanup();
    cleanup = null;
  });

  UserAgentList.forEach(({ browser, os }) => {
    [
      {
        start: 60,
        end: 70,
        version: 70,
        expected: true,
      },
      {
        start: 60,
        end: 70,
        version: 60,
        expected: true,
      },
      {
        start: 60,
        end: 70,
        version: 71,
        expected: false,
      },
      {
        start: 60,
        end: 70,
        version: 59,
        expected: false,
      },
      {
        start: null,
        end: 70,
        version: 70,
        expected: true,
      },
      {
        start: null,
        end: 70,
        version: 71,
        expected: false,
      },
      {
        start: null,
        end: 70,
        version: 69,
        expected: true,
      },
      {
        start: 60,
        end: null,
        version: 59,
        expected: false,
      },
      {
        start: 60,
        end: null,
        version: 60,
        expected: true,
      },
      {
        start: 60,
        end: null,
        version: 61,
        expected: true,
      },
    ].forEach(({
      version,
      start,
      end,
      expected,
    }) => {
      test(
        `${expected ? 'inside' : 'outside'} (${start}, ${end}) for ${browser} on ${os} should be ${expected} for ${version}`,
        () => {
          const userAgent = getUserAgentFor({ browser, os, version });
          setUserAgent(userAgent);
          const actual = checkBrowserVersion(start, end);
          expect(navigator.userAgent).toBe(userAgent);
          expect(actual).toBe(expected);
        },
      );
    });
  });
});
