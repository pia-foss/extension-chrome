/* eslint import/first: 0, no-use-before-define: 0 */
import http from '@helpers/http';
import { MessageType } from '@data/https-upgrade';
import { extract } from './worker';
import {
  applyRuleset,
  getTimestamp,
  partsToTargetMap,
  getDefaultChannel,
  getStoredRulesets,
  setStoredRulesets,
  getHostedRulesets,
} from './rulesets';

jest.mock('@helpers/http');

describe('@util > https-upgrade > rulesets', () => {
  describe('#applyRuleset', () => {
    [
      {
        ruleset: {
          name: 'simple',
          rule: [{
            from: '^http:',
            to: 'https:',
          }],
        },
        url: 'http://neovim.io',
        expected: 'https://neovim.io',
      },
      {
        ruleset: {
          name: 'exclusion',
          rule: [{
            from: '^http:',
            to: 'https:',
          }],
          exclusions: /^http:\/\/(www\.)?neovim\.io/,
        },
        url: 'http://neovim.io',
        expected: undefined,
      },
    ].forEach(({ ruleset, url, expected }) => {
      test(`applying ${ruleset.name} to ${url} should give ${expected}`, async () => {
        const actual = applyRuleset(ruleset, url);
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#extract', () => {
    let gz;
    let decode;

    beforeEach(() => {
      decode = jest.fn().mockReturnValue(JSON.stringify({ test: 'test' }));
      // eslint-disable-next-line prefer-arrow-callback
      window.TextDecoder = jest.fn().mockImplementation(function constructor() {
        return { decode };
      });
      gz = Uint8Array.from(
        atob('H4sICPWlm1wAA3Rlc3QAq1ZQKkktLlGygtIKtVwAsJiS3BMAAAA='),
        (c) => {
          return c.charCodeAt(0);
        },
      );
    });

    test('successfully decompresses gz file', async () => {
      const extracted = await extract(gz);
      const expected = new Uint8Array(
        [
          123, 32, 34, 116, 101, 115,
          116, 34, 58, 32, 34, 116,
          101, 115, 116, 34, 32, 125, 10,
        ],
      );
      expect(decode).toBeCalledWith(expected);
      expect(extracted.test).toEqual('test');
    });
  });

  describe('#getDefaultChannel', () => {
    test('should retrieve channel named "default"', async () => {
      const channel = getDefaultChannel();
      expect(channel.name).toEqual('default');
    });
  });

  describe('#getStoredRulesets', () => {
    test('generates valid keys', async () => {
      const storageCount = 5;
      const expectedKeys = [
        'https-upgrade::0',
        'https-upgrade::1',
        'https-upgrade::2',
        'https-upgrade::3',
        'https-upgrade::4',
      ];

      chrome.storage.local.get.mockImplementation((_, cb) => {
        cb({});
      });
      await getStoredRulesets(storageCount);

      const { calls } = chrome.storage.local.get.mock;
      expectedKeys.forEach((key, index) => {
        const call = calls[index];
        expect(call[0]).toEqual(key);
      });
    });

    test('returns retrieved parts', async () => {
      const storageCount = 2;
      const iter = [
        { 'https-upgrade::0': 'first' },
        { 'https-upgrade::1': 'second' },
      ].values();
      chrome.storage.local.get.mockImplementation((_, cb) => {
        cb(iter.next().value);
      });

      const parts = await getStoredRulesets(storageCount);
      expect(parts[0]).toEqual('first');
      expect(parts[1]).toEqual('second');
    });

    test('throws error on invalid number', async () => {
      let failed = false;
      try {
        await getStoredRulesets(-1);
      }
      catch (err) {
        failed = true;
      }

      expect(failed).toEqual(true);
    });
  });

  describe('#setStoredRulesets', () => {
    test('stores new parts', async () => {
      // assign
      chrome.storage.local.set.mockImplementation((_, cb) => { cb(); });
      const parts = ['first', 'second'];
      const oldCount = 2;

      // act
      await setStoredRulesets(parts, oldCount);

      // assert
      const { calls } = chrome.storage.local.set.mock;
      expect(calls[0][0]).toEqual({ 'https-upgrade::0': 'first' });
      expect(calls[1][0]).toEqual({ 'https-upgrade::1': 'second' });
    });

    test('removes extra parts', async () => {
      // assign
      chrome.storage.local.set.mockImplementation((_, cb) => { cb(); });
      chrome.storage.local.remove.mockImplementation((_, cb) => { cb(); });
      const parts = ['first', 'second'];
      const oldCount = 5;
      const expectedKeys = [
        'https-upgrade::2',
        'https-upgrade::3',
        'https-upgrade::4',
      ];

      // act
      await setStoredRulesets(parts, oldCount);

      // assert
      const { calls } = chrome.storage.local.remove.mock;
      const keys = calls[0][0];
      expect(keys).toEqual(expectedKeys);
      expect(chrome.storage.local.remove).toBeCalledTimes(1);
    });
  });

  describe('#getTimestamp', () => {
    let timestamp;
    let ok;
    let channel;

    beforeEach(() => {
      http.$response = Promise.resolve({
        text() {
          return Promise.resolve(timestamp);
        },
        get ok() {
          return ok;
        },
      });
      channel = {
        name: 'default',
        urlPrefix: 'https://s3.amazonaws.com/privateinternetaccess/',
      };
    });

    test('throws error on invalid number', async () => {
      let failed = false;
      timestamp = 'not a number';
      ok = true;
      try {
        await getTimestamp(channel);
      }
      catch (err) {
        failed = true;
      }
      expect(failed).toEqual(true);
    });

    test('throws error on failed request', async () => {
      let failed = false;
      timestamp = '5';
      ok = false;
      try {
        await getTimestamp(channel);
      }
      catch (err) {
        failed = true;
      }
      expect(failed).toEqual(true);
    });
  });

  describe('#getHostedRulesets', () => {
    const extracted = {
      rulesets: [
        { name: 'first' },
        { name: 'second' },
      ],
    };
    let worker;

    // TODO: Should I not export extract and instead test it via this?
    // same w/ getBuffer
    beforeEach(() => {
      worker = {
        addEventListener: jest.fn().mockImplementation((_, cb) => {
          cb({
            data: {
              payload: { reqID: 0, extracted },
              type: MessageType.EXTRACT_RES,
            },
          });
        }),
        postMessage: jest.fn(),
        terminate: jest.fn(),
      };
      window.Worker = jest.fn()
        .mockName('Worker')
        // eslint-disable-next-line prefer-arrow-callback
        .mockImplementation(function constructor() {
          return worker;
        });
      http.$response = Promise.resolve({
        ok: true,
        arrayBuffer() {
          return Promise.resolve('buffer');
        },
      });
    });

    test('gets buffer successfully', async () => {
      await getHostedRulesets(getDefaultChannel());
      const { calls } = worker.postMessage.mock;
      const { payload: { rulesBuffer } } = calls[0][0];
      expect(rulesBuffer).toEqual('buffer');
    });

    test('gets rulesets successfully', async () => {
      const parts = await getHostedRulesets(getDefaultChannel());
      const [rulesets] = parts;
      expect(rulesets).toEqual(extracted.rulesets);
    });
  });

  /**
   * #partsToTargetMap
   *
   * parts (NxM)
   * -----------
   * N - number of parts
   * M - number of rulesets per part
   *
   * map (A:B:C)
   * ---------
   * A - Entry one, number of rulesets
   * B - entry two, number of rulesets
   * C - entry three, number of rulesets
   */
  describe('#partsToTargetMap', () => {
    let simplePartA;
    let simplePartB;
    let duplicateTarget;
    let missingTargetPart;
    let simplePartADuplicate;

    beforeEach(() => {
      simplePartA = [
        { target: ['a'], id: 1 },
        { target: ['b'], id: 2 },
      ];
      simplePartB = [
        { target: ['c'], id: 3 },
        { target: ['d'], id: 4 },
      ];
      duplicateTarget = [
        { target: ['e'], id: 5 },
        { target: ['e'], id: 6 },
      ];
      missingTargetPart = [
        { target: ['f'], id: 7 },
        { id: 8 },
      ];
      simplePartADuplicate = [
        { target: ['a'], id: 9 },
        { target: ['b'], id: 10 },
      ];
    });

    describe('1x2', () => {
      test('resulting map 1:1', async () => {
        const map = await partsToTargetMap([simplePartA]);
        expect(map.size).toEqual(2);
        expect(map.get('a').size).toEqual(1);
        expect(map.get('a').values().next().value.id).toEqual(1);
        expect(map.get('b').size).toEqual(1);
        expect(map.get('b').values().next().value.id).toEqual(2);
      });
    });

    describe('2x2', () => {
      test('resulting map 1:1:1:1', async () => {
        const map = await partsToTargetMap([simplePartA, simplePartB]);
        expect(map.size).toEqual(4);
        expect(map.get('a').size).toEqual(1);
        expect(map.get('a').values().next().value.id).toEqual(1);
        expect(map.get('b').size).toEqual(1);
        expect(map.get('b').values().next().value.id).toEqual(2);
        expect(map.get('c').size).toEqual(1);
        expect(map.get('c').values().next().value.id).toEqual(3);
        expect(map.get('d').size).toEqual(1);
        expect(map.get('d').values().next().value.id).toEqual(4);
      });
    });

    describe('duplicate target, 1x2', () => {
      test('resulting map 2:', async () => {
        const map = await partsToTargetMap([duplicateTarget]);
        expect(map.size).toEqual(1);
        expect(map.get('e').size).toEqual(2);
        const ids = Array.from(map.get('e').values())
          .map((value) => { return value.id; });
        expect(ids).toHaveLength(2);
        expect(ids).toContainEqual(5);
        expect(ids).toContainEqual(6);
      });
    });

    describe('duplicate target, 2x2', () => {
      test('resulting map 2:2', async () => {
        const map = await partsToTargetMap([simplePartA, simplePartADuplicate]);
        expect(map.size).toEqual(2);
        expect(map.get('a').size).toEqual(2);
        const aIds = Array.from(map.get('a').values())
          .map((value) => { return value.id; });
        expect(aIds).toHaveLength(2);
        expect(aIds).toContainEqual(1);
        expect(aIds).toContainEqual(9);

        expect(map.get('b').size).toEqual(2);
        const bIds = Array.from(map.get('b').values())
          .map((value) => { return value.id; });
        expect(bIds).toHaveLength(2);
        expect(bIds).toContainEqual(2);
        expect(bIds).toContainEqual(10);
      });
    });

    describe('missing target, 1x2', () => {
      test('resulting map 1:', async () => {
        const map = await partsToTargetMap([missingTargetPart]);
        expect(map.size).toEqual(1);
        expect(map.get('f').size).toEqual(1);
        expect(map.get('f').values().next().value.id).toEqual(7);
      });
    });
  });
});
