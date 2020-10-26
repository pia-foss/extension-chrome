/* eslint import/first: 0, no-use-before-define: 0 */
import MockApp from '@mocks/app';
import { ALARM_NAME } from '@data/https-upgrade';
import HttpsUpgrade from '@util/https-upgrade';

jest.mock('@util/https-upgrade/rulesets');
import {
  getHostedRulesets,
  getStoredRulesets,
  setStoredRulesets,
  partsToTargetMap,
  getTimestamp,
  applyRuleset,
} from '@util/https-upgrade/rulesets';

const {
  LAST_TIMESTAMP_KEY,
  STORAGE_COUNT_KEY,
  COUNTER_LIMIT,
} = jest.requireActual('../../data/https-upgrade');

const RELATIVE_DOMAIN = 'relative/../domain.io';
const WILDCARD_DOMAIN = '*.wildcard.io';
const REMOTE_TIMESTAMP = '1551306687';
const PARTS_COUNT = '3';
const Timestamp = {
  empty: null,
  upToDate: '1551306687',
  outOfDate: '1551306680',
};

describe('@util > HttpsUpgrade', () => {
  let subject;
  let app;

  beforeEach(() => {
    app = new MockApp();
    app.util.storage.mockValues.getItem.set(STORAGE_COUNT_KEY, PARTS_COUNT);
    app.util.storage.mockValues.getItem.set(LAST_TIMESTAMP_KEY, Timestamp.empty);
    app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
  });

  async function setup({
    mockGetHostedRulesets = true,
    mockSetStoredRulesets = true,
    mockPartsToTargetMap = true,
    mockGetStoredRulesets = true,
    mockApplyRuleset = true,
    customizeSubject = null,
  } = {}) {
    getTimestamp.mockReturnValueOnce(Promise.resolve(REMOTE_TIMESTAMP));
    if (mockApplyRuleset) {
      applyRuleset
        .mockName('#applyRuleset');
    }
    if (mockGetHostedRulesets) {
      getHostedRulesets
        .mockName('#getHostedRulesets')
        .mockReturnValue(Promise.resolve(createMockParts()));
    }
    if (mockSetStoredRulesets) {
      setStoredRulesets
        .mockName('#setStoredRulesets')
        .mockReturnValue(Promise.resolve());
    }
    if (mockPartsToTargetMap) {
      partsToTargetMap
        .mockName('#partsToTargetMap')
        .mockReturnValue(Promise.resolve(createMockTargets()));
    }
    if (mockGetStoredRulesets) {
      getStoredRulesets
        .mockName('#getStoredRulesets')
        .mockReturnValue(Promise.resolve(createMockParts()));
    }
    subject = new HttpsUpgrade(app);
    if (customizeSubject) {
      const result = await Promise.resolve(customizeSubject(subject));
      await subject.initializing;
      return result;
    }
    await subject.initializing;
    return undefined;
  }

  describe('#constructor', () => {
    test('should set up alarm', async () => {
      await setup();
      expect(chrome.alarms.create).toBeCalledTimes(1);
    });

    test('should call init', async () => {
      const spy = jest.spyOn(HttpsUpgrade.prototype, 'init');
      await setup();
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('#init', () => {
    [
      {
        desc: 'no local timestamp',
        beforeEachFn() {
          app.util.storage.mockValues.getItem.set('LAST_TIMESTAMP_KEY', Timestamp.empty);
        },
      },
      {
        desc: 'local timestamp out of date',
        beforeEachFn() {
          app.util.storage.mockValues.getItem.set('LAST_TIMESTAMP_KEY', Timestamp.outOfDate);
        },
      },
    ].forEach(({ desc, beforeEachFn }) => {
      describe(desc, () => {
        beforeEach(beforeEachFn);

        test('should fetch remote rulesets', async () => {
          await setup();

          expect(getHostedRulesets).toBeCalledTimes(1);
        });

        test('should assign to rulesets once', async () => {
          const set = jest.fn();
          const get = jest.fn().mockImplementation(() => { throw new Error(); });
          await setup({
            customizeSubject(s) {
              Object.defineProperty(s, 'rulesets', {
                configurable: true,
                get,
                set,
              });
            },
          });
          expect(set).toBeCalledTimes(1);
        });

        test('should report updating', async () => {
          getHostedRulesets.mockImplementation(() => {
            expect(subject.updating).toStrictEqual(true);
            return Promise.resolve([]);
          });
          await setup({
            mockGetHostedRulesets: false,
            customizeSubject(s) {
              expect(s.updating).toStrictEqual(false);
            },
          });

          expect(subject.updating).toStrictEqual(false);
        });

        test('should clear rulesetsCache', async () => {
          const spy = await setup({
            customizeSubject(s) {
              return jest.spyOn(s.rulesetsCache, 'clear');
            },
          });
          expect(spy).toBeCalledTimes(1);
        });

        test('should update stored rulesets', async () => {
          const parts = createMockParts();
          getHostedRulesets.mockReturnValueOnce(Promise.resolve(parts));
          await setup({
            mockGetHostedRulesets: false,
          });
          expect(setStoredRulesets).toBeCalledTimes(1);
          expect(setStoredRulesets).toHaveBeenLastCalledWith(parts, PARTS_COUNT);
        });
      });
    });

    describe('local timestamp up to date', () => {
      const timestamp = Timestamp.upToDate;

      beforeEach(() => {
        app.util.storage.mockValues.getItem.set(LAST_TIMESTAMP_KEY, Timestamp.upToDate);
        app.util.storage.mockValues.getItem.set(STORAGE_COUNT_KEY, PARTS_COUNT);
      });

      test('should retrieve stored rulesets', async () => {
        await setup();

        expect(getStoredRulesets).toHaveBeenCalledTimes(1);
      });

      test('should assign to rulesets once', async () => {
        const set = jest.fn();
        const get = jest.fn().mockImplementation(() => { throw new Error(); });
        await setup({
          timestamp,
          customizeSubject(s) {
            Object.defineProperty(s, 'rulesets', {
              configurable: true,
              get,
              set,
            });
          },
        });
        expect(set).toBeCalledTimes(1);
      });

      test('should clear rulesetsCache', async () => {
        const spy = await setup({
          timestamp,
          customizeSubject(s) {
            return jest.spyOn(s.rulesetsCache, 'clear');
          },
        });
        expect(spy).toBeCalledTimes(1);
      });
    });
  });

  describe('#onAlarm', () => {
    beforeEach(async () => {
      await setup();
      subject.attemptUpdate = jest
        .fn()
        .mockName('attemptUpdate')
        .mockReturnValueOnce(Promise.resolve());
    });

    describe('alarm name matches', () => {
      test('should call attemptUpdate', async () => {
        await subject.onAlarm({ name: ALARM_NAME });
        expect(subject.attemptUpdate).toBeCalledTimes(1);
      });
    });

    describe('alarm name doesn\'t match', () => {
      test('should not call attemptUpdate', async () => {
        await subject.onAlarm({ name: 'INVALID_ALARM_NAME' });
        expect(subject.attemptUpdate).toBeCalledTimes(0);
      });
    });
  });

  describe('#enabled', () => {
    beforeEach(async () => {
      app.util.settings.enabled.mockReturnValue(true);
      await setup();
    });

    describe('setting enabled', () => {
      beforeEach(async () => {
        app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
      });

      test('should return true', async () => {
        expect(subject.enabled()).toEqual(true);
      });
    });

    describe('setting disabled', () => {
      beforeEach(async () => {
        app.util.settings.mockValues.isActive.set('httpsUpgrade', false);
      });

      test('should return false', async () => {
        expect(subject.enabled()).toEqual(false);
      });

      describe('called twice', () => {
        test('should not perform cleanup', async () => {
          subject.enabled();
          subject.counter = { clear: jest.fn() };
          subject.cookieCache = { clear: jest.fn() };
          subject.enabled();
          expect(subject.counter.clear).not.toHaveBeenCalled();
          expect(subject.cookieCache.clear).not.toHaveBeenCalled();
        });
      });
    });

    describe('setting enabled, then disabled', () => {
      test('should perform cleanup', async () => {
        app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
        subject.counter = { clear: jest.fn() };
        subject.cookieCache = { clear: jest.fn() };
        subject.enabled();
        expect(subject.counter.clear).not.toHaveBeenCalled();
        expect(subject.cookieCache.clear).not.toHaveBeenCalled();
        app.util.settings.mockValues.isActive.set('httpsUpgrade', false);
        subject.enabled();
        expect(subject.counter.clear).toBeCalledTimes(1);
        expect(subject.cookieCache.clear).toBeCalledTimes(1);
      });
    });
  });

  describe('#onBeforeRequest', () => {
    beforeEach(async () => {
      await setup();
      app.util.settings.enabled.mockReturnValue(true);
      app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
    });

    test('ignores long domains', async () => {
      const url = longDomain();
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(result).toEqual(undefined);
    });

    test('ignores requests when setting disabled', async () => {
      app.util.settings.enabled.mockClear().mockReturnValue(false);
      const url = new URL('http://dell.com').href;
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(result).toEqual(undefined);
    });

    test('ignores empty domains', async () => {
      const url = '';
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(result).toEqual(undefined);
    });

    test('ignores domains containing ".."', async () => {
      const url = `http://${RELATIVE_DOMAIN}`;
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(result).toEqual(undefined);
    });

    test('searches for wildcards', async () => {
      const url = `http://${WILDCARD_DOMAIN.replace('*', 'hello.test')}`;
      applyRuleset.mockReturnValueOnce(url.replace('http', 'https'));
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(result.redirectUrl).toEqual(url.replace('http', 'https'));
    });

    test('ignores blacklisted domains', async () => {
      const url = new URL('http://neovim.io/').href;
      subject.hrefBlacklist.add(url);
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(applyRuleset).not.toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });

    test('ignores domains with no match', async () => {
      const url = new URL('http://github.com/').href;
      const details = createDetails({ url });
      const result = subject.onBeforeRequest(details);
      expect(applyRuleset).not.toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });

    test('does not strip credentials from request', async () => {
      const url = new URL('http://username:password@neovim.io').href;
      const details = createDetails({ url });
      applyRuleset.mockReturnValueOnce(url.replace('http', 'https'));
      const result = subject.onBeforeRequest(details);
      expect(result.redirectUrl).toEqual('https://username:password@neovim.io/');
    });

    test('returns upgraded url for matched domain', async () => {
      const url = new URL('http://neovim.io').href;
      const details = createDetails({ url });
      applyRuleset.mockReturnValueOnce(url.replace('http', 'https'));
      const result = subject.onBeforeRequest(details);
      expect(result.redirectUrl).toEqual('https://neovim.io/');
    });

    test('returns upgraded url for matched domain and consecutive requests', async () => {
      const url = new URL('http://neovim.io').href;
      const details = createDetails({ url });
      applyRuleset.mockReturnValue(url.replace('http', 'https'));
      const resultA = subject.onBeforeRequest(details);
      const resultB = subject.onBeforeRequest(details);
      expect(resultA.redirectUrl).toEqual('https://neovim.io/');
      expect(resultB.redirectUrl).toEqual('https://neovim.io/');
    });

    test(`will blacklist domain after ${COUNTER_LIMIT} requests`, async () => {
      const url = new URL('http://neovim.io').href;
      const details = createDetails({ url });
      subject.counter.set(details.requestId, COUNTER_LIMIT);
      const result = subject.onBeforeRequest(details);
      expect(result).toEqual(undefined);
      expect(subject.hrefBlacklist.has(url)).toEqual(true);
    });
  });

  describe('#onCookieChanged', () => {
    beforeEach(async () => {
      await setup();
      app.util.settings.enabled.mockReturnValue(true);
      app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
    });

    test('ignores unmatched domains', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: 'github.com',
        }),
      });
      subject.onCookieChanged(details);
      expect(chrome.cookies.set).not.toHaveBeenCalled();
    });

    test('ignores long domains', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: longDomain(),
        }),
      });
      subject.onCookieChanged(details);
      expect(chrome.cookies.set).not.toHaveBeenCalled();
    });

    test('ignores empty domains', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: '',
        }),
      });
      subject.onCookieChanged(details);
      expect(chrome.cookies.set).not.toHaveBeenCalled();
    });

    test('ignores domains containing ".."', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: RELATIVE_DOMAIN,
        }),
      });
      subject.onCookieChanged(details);
      expect(chrome.cookies.set).not.toHaveBeenCalled();
    });

    test('matches wildcard domains', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: 'test.wildcard.io',
        }),
      });
      applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
      subject.onCookieChanged(details);
      expect(applyRuleset).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
      const [secured] = chrome.cookies.set.mock.calls[0];
      expect(secured).toBeTruthy();
    });

    test('basic cookie info present in secured cookie', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: 'neovim.io',
        }),
      });
      applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
      subject.onCookieChanged(details);

      expect(applyRuleset).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
      const [secured] = chrome.cookies.set.mock.calls[0];

      expect(secured.name).toEqual(details.cookie.name);
      expect(secured.value).toEqual(details.cookie.value);
      expect(secured.path).toEqual(details.cookie.path);
      expect(secured.httpOnly).toEqual(details.cookie.httpOnly);
      expect(secured.expirationDate).toEqual(details.cookie.expirationDate);
      expect(secured.storeId).toEqual(details.cookie.storeId);
    });

    test('should cache matches', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: 'neovim.io',
        }),
      });
      applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
      subject.onCookieChanged(details);

      expect(subject.cookieCache.get('neovim.io')).toEqual(true);
    });

    test('matched cookie should be secured', async () => {
      const details = createDetails({
        cookie: createMockCookie({
          domain: 'neovim.io',
        }),
      });
      applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
      subject.onCookieChanged(details);

      expect(applyRuleset).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
      const [secured] = chrome.cookies.set.mock.calls[0];
      expect(secured.secure).toEqual(true);
    });

    test('original cookie is not altered', async () => {
      const details = createDetails({
        cookie: Object.freeze(createMockCookie({
          domain: 'neovim.io',
        })),
      });
      applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
      subject.onCookieChanged(details);
      expect(applyRuleset).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
      const [secured] = chrome.cookies.set.mock.calls[0];
      expect(secured).toBeTruthy();
    });

    describe('cookie was removed', () => {
      test('ignores request', async () => {
        const details = createDetails({
          cookie: createMockCookie({
            domain: 'neovim.io',
          }),
        });
        details.removed = true;
        subject.onCookieChanged(details);

        expect(applyRuleset).not.toHaveBeenCalled();
        expect(chrome.cookies.set).not.toHaveBeenCalled();
      });
    });

    describe('cookie is secure', () => {
      test('ignores request', async () => {
        const details = createDetails({
          cookie: createMockCookie({
            domain: 'neovim.io',
            secure: true,
          }),
        });
        subject.onCookieChanged(details);

        expect(applyRuleset).not.toHaveBeenCalled();
        expect(chrome.cookies.set).not.toHaveBeenCalled();
      });
    });

    describe('hostOnly', () => {
      describe('false', () => {
        test('should copy domain', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'neovim.io',
              hostOnly: false,
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.domain).toEqual('neovim.io');
        });
      });

      describe('true', () => {
        test('should not copy domain', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'neovim.io',
              hostOnly: true,
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.domain).toBeUndefined();
        });
      });
    });

    describe('sameSite', () => {
      describe('true', () => {
        test('should copy sameSite', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'neovim.io',
              sameSite: true,
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.sameSite).toEqual(true);
        });
      });
      describe('false', () => {
        test('secure cookie sameSite should be undefined', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'neovim.io',
              hostOnly: false,
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.sameSite).toBeUndefined();
        });
      });
    });

    describe('firstPartyDomain', () => {
      describe('truthy', () => {
        test('copies to cookie', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'neovim.io',
              firstPartyDomain: 'test',
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.firstPartyDomain).toEqual('test');
        });
      });

      describe('falsy', () => {
        test('does not copy to cookie', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'neovim.io',
              firstPartyDomain: false,
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.firstPartyDomain).toBeUndefined();
        });
      });
    });

    describe('domain', () => {
      describe('starts with .', () => {
        test('uses www with url', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: '.test.wildcard.io',
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.url).toContain('www');
        });
      });

      describe('does not start with .', () => {
        test('does not use www with url', async () => {
          const details = createDetails({
            cookie: createMockCookie({
              domain: 'test.wildcard.io',
            }),
          });
          applyRuleset.mockImplementation((_, url) => { return url.replace('http', 'https'); });
          subject.onCookieChanged(details);
          expect(applyRuleset).toHaveBeenCalledTimes(1);
          expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
          const [secured] = chrome.cookies.set.mock.calls[0];
          expect(secured.url).not.toContain('www');
        });
      });
    });
  });

  describe('#onCompleted', () => {
    let details;

    beforeEach(async () => {
      const url = new URL('http://neovim.io').href;
      details = createDetails({ url });
      await setup();
      app.util.settings.enabled.mockReturnValue(true);
      app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
    });

    describe('counter > 0', () => {
      test('should delete counter entry', async () => {
        subject.counter.set(details.requestId, 3);
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });

    describe('counter == 0', () => {
      test('should delete counter entry', async () => {
        subject.counter.set(details.requestId, 0);
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });

    describe('counter < 0', () => {
      test('should delete counter entry', async () => {
        subject.counter.set(details.requestId, -1);
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });

    describe('counter undefined', () => {
      test('should have no effect', async () => {
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });
  });

  describe('#onErrorOccurred', () => {
    let details;

    beforeEach(async () => {
      const url = new URL('http://neovim.io').href;
      details = createDetails({ url });
      await setup();
      app.util.settings.enabled.mockReturnValue(true);
      app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
    });

    describe('counter > 0', () => {
      test('should delete counter entry', async () => {
        subject.counter.set(details.requestId, 3);
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });

    describe('counter == 0', () => {
      test('should delete counter entry', async () => {
        subject.counter.set(details.requestId, 0);
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });

    describe('counter < 0', () => {
      test('should delete counter entry', async () => {
        subject.counter.set(details.requestId, -1);
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });

    describe('counter undefined', () => {
      test('should have no effect', async () => {
        subject.onCompleted(details);
        expect(subject.counter.get(details.requestId)).toEqual(undefined);
      });
    });
  });

  describe('#onBeforeRedirect', () => {
    let requestId;
    let http;
    let ftp;

    beforeEach(async () => {
      http = new URL('https://neovim.io').href;
      ftp = new URL('ftp://neovim.io').href;
      ({ requestId } = createDetails({ url: http }));
      await setup();
      app.util.settings.enabled.mockReturnValue(true);
      app.util.settings.mockValues.isActive.set('httpsUpgrade', true);
    });

    describe('counter > 0', () => {
      test('should increment counter for requests using http protocol', async () => {
        subject.counter.set(requestId, 5);
        subject.onBeforeRedirect({ requestId, redirectUrl: http });
        expect(subject.counter.get(requestId)).toEqual(6);
      });

      test('should ignore requests not using http protocol', async () => {
        subject.counter.set(requestId, 5);
        subject.onBeforeRedirect({ requestId, redirectUrl: ftp });
        expect(subject.counter.get(requestId)).toEqual(5);
      });
    });

    describe('counter undefined', () => {
      test('should initialize counter for requests using http protocol', async () => {
        subject.onBeforeRedirect({ requestId, redirectUrl: http });
        expect(subject.counter.get(requestId)).toEqual(1);
      });

      test('should ignore requests not using http protocol', async () => {
        subject.onBeforeRedirect({ requestId, redirectUrl: ftp });
        expect(subject.counter.get(requestId)).toEqual(undefined);
      });
    });

    describe('counter < 0', () => {
      test('should initialize counter for requests using http protocol', async () => {
        subject.counter.set(requestId, -5);
        subject.onBeforeRedirect({ requestId, redirectUrl: http });
        expect(subject.counter.get(requestId)).toEqual(1);
      });

      test('should ignore requests not using http protocol', async () => {
        subject.counter.set(requestId, -5);
        subject.onBeforeRedirect({ requestId, redirectUrl: ftp });
        expect(subject.counter.get(requestId)).toEqual(-5);
      });
    });

    describe('counter == 0', () => {
      test('should increment count for requests using http protocol', async () => {
        subject.counter.set(requestId, 0);
        subject.onBeforeRedirect({ requestId, redirectUrl: http });
        expect(subject.counter.get(requestId)).toEqual(1);
      });

      test('should ignore requests not using http protocol', async () => {
        subject.counter.set(requestId, 0);
        subject.onBeforeRedirect({ requestId, redirectUrl: ftp });
        expect(subject.counter.get(requestId)).toEqual(0);
      });
    });
  });
});

// Mock Data

function createMockCookie({
  name = 'fake_cookie',
  value = 'value',
  domain = 'neovim.io',
  path = '/',
  secure = false,
  hostOnly = false,
  sameSite = false,
  expirationDate = '2020-02-06T18:17:13.000Z',
  storeId = 'storeId',
  httpOnly = false,
  firstPartyDomain = undefined,
} = {}) {
  return {
    name,
    value,
    domain,
    path,
    secure,
    hostOnly,
    sameSite,
    expirationDate,
    storeId,
    httpOnly,
    firstPartyDomain,
  };
}

function createMockParts() {
  return [
    [
      {
        name: 'Neovim.io',
        target: [
          'neovim.io',
          'www.neovim.io',
        ],
        securecookie: [
          {
            host: '^\\.',
            name: '^(?:__cfduid|cf_clearance)$',
          },
          {
            host: '^\\w',
            name: '.+',
          },
        ],
        rule: [
          {
            from: '^http:',
            to: 'https:',
          },
        ],
      },
      {
        name: '1.1.1.1',
        target: [
          '1.1.1.1',
        ],
        securecookie: [{
          host: '.+',
          name: '.+',
        }],
        rule: [{
          from: '^http:',
          to: 'https:',
        }],
      },
      {
        name: 'Dell.com (false MCB)',
        platform: 'mixedcontent',
        rule: [{
          from: '^http://(www\\.)?dell\\.com/(?!content/|favicon\\.ico)',
          to: 'https://www.dell.com/',
        }],
        target: ['dell.com'],
      },
    ],
    [
      {
        name: 'Dell.com (partial)',
        rule: [{
          from: '^http://(www-cdn\\.)?dell\\.com/',
          to: 'https://www.dell.com/',
        }, {
          from: '^http://i\\.dell\\.com/',
          to: 'https://si.cdn.dell.com/',
        }, {
          from: '^http:',
          to: 'https:',
        }],
        securecookie: [{
          host: '.+',
          name: '.+',
        }],
        target: ['dell.com'],
      },
      simpleRule('longdomain.io', longDomain()),
      simpleRule('relativeDomain.io', RELATIVE_DOMAIN),
    ],
    [
      simpleRule('wildcard.io', WILDCARD_DOMAIN),
    ],
  ];
}

function createMockTargets() {
  const map = new Map();
  const neovimSet = new Set();
  neovimSet.add({
    name: 'Neovim.io',
    target: [
      'neovim.io',
      'www.neovim.io',
    ],
    securecookie: [
      {
        host: '^\\.',
        name: '^(?:__cfduid|cf_clearance)$',
      },
      {
        host: '^\\w',
        name: '.+',
      },
    ],
    rule: [
      {
        from: '^http:',
        to: 'https:',
      },
    ],
  });
  const wwwNeovimSet = new Set();
  wwwNeovimSet.add({
    name: 'Neovim.io',
    target: [
      'neovim.io',
      'www.neovim.io',
    ],
    securecookie: [
      {
        host: '^\\.',
        name: '^(?:__cfduid|cf_clearance)$',
      },
      {
        host: '^\\w',
        name: '.+',
      },
    ],
    rule: [
      {
        from: '^http:',
        to: 'https:',
      },
    ],
  });
  const dnsSet = new Set();
  dnsSet.add({
    name: '1.1.1.1',
    target: [
      '1.1.1.1',
    ],
    securecookie: [{
      host: '.+',
      name: '.+',
    }],
    rule: [{
      from: '^http:',
      to: 'https:',
    }],
  });
  const dellSet = new Set();
  dellSet.add({
    name: 'Dell.com (false MCB)',
    platform: 'mixedcontent',
    rule: [{
      from: '^http://(www\\.)?dell\\.com/(?!content/|favicon\\.ico)',
      to: 'https://www.dell.com/',
    }],
    target: ['dell.com'],
  });
  dellSet.add({
    name: 'Dell.com (partial)',
    rule: [{
      from: '^http://(www-cdn\\.)?dell\\.com/',
      to: 'https://www.dell.com/',
    }, {
      from: '^http://i\\.dell\\.com/',
      to: 'https://si.cdn.dell.com/',
    }, {
      from: '^http:',
      to: 'https:',
    }],
    securecookie: [{
      host: '.+',
      name: '.+',
    }],
    target: ['dell.com'],
  });
  const longDomainSet = new Set();
  longDomainSet.add(simpleRule('longdomain.io', longDomain()));
  const relativeDomainSet = new Set();
  relativeDomainSet.add(simpleRule('relativeDomain.io', RELATIVE_DOMAIN));
  const wildcardDomainSet = new Set();
  wildcardDomainSet.add(simpleRule('wildcard.io', WILDCARD_DOMAIN));
  const emptyDomainSet = new Set();
  emptyDomainSet.add(simpleRule('empty', ''));
  map.set('neovim.io', neovimSet);
  map.set('www.neovim.io', wwwNeovimSet);
  map.set('1.1.1.1', dnsSet);
  map.set('dell.com', dellSet);
  map.set(longDomain(), longDomainSet);
  map.set(RELATIVE_DOMAIN, relativeDomainSet);
  map.set(WILDCARD_DOMAIN, wildcardDomainSet);
  map.set('', emptyDomainSet);
  return map;
}

function simpleRule(name, domain) {
  return {
    name,
    target: [
      domain,
    ],
    securecookie: [{
      host: '.+',
      name: '.+',
    }],
    rule: [{
      from: '^http:',
      to: 'https:',
    }],
  };
}

function longDomain() {
  const body = [...Array(260)].map(() => { return 'a'; }).join('');
  return `http://${body}.io`;
}

/**
 * Create details object
 *
 * @param {*} args
 * @param {string} args.url
 */
function createDetails(
  { url = '', cookie = {}, removed = false } = {},
  count = 0,
) {
  const idStr = [...Array(url.length)]
    .map((_, i) => { return url.charCodeAt(i); })
    .map((code) => { return code + count; })
    .join('');
  const requestId = Number(idStr) + count + 1;
  return {
    url,
    cookie,
    removed,
    requestId,
  };
}
