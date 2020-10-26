/* eslint no-restricted-syntax: 0 */
import http from '@helpers/http';
import timer from '@helpers/timer';
import reportError from '@helpers/reportError';
import {
  PART_SIZE,
  STORAGE_TEMPLATE,
  LATEST_TIMESTAMP_FILE,
  RULESET_FILE_TEMPLATE,
  MessageType,
  channels,
} from '@data/https-upgrade';

// ======================================== //
//                 General                  //
// ======================================== //

/**
 * Get the default channel for rulesets
 */
export function getDefaultChannel() {
  return channels.find((c) => { return c.name === 'default'; });
}

/**
 * Attempt to apply a ruleset to a url
 *
 * @returns {string|undefined}
 */
export function applyRuleset(ruleset, url) {
  const {
    rule: rules,
    exclusions,
  } = ruleset;

  if (!rules) {
    return undefined;
  }
  if (typeof exclusions !== 'undefined') {
    if (exclusions instanceof RegExp) {
      if (exclusions.test(url)) {
        debug(`https-upgrade/rulesets#applyRuleset: ${url} excluded`);
        return undefined;
      }
    }
    else {
      debug('https-upgrade/rulesets#applyRuleset: invalid exclusions');
      debug(`typeof exclusions: ${typeof exclusions}`);
      debug(`exclusions value: ${exclusions}`);
    }
  }

  let applied;
  return rules.find((rule) => {
    if (rule.to === null || rule.from === null) { return false; }
    applied = url.replace(new RegExp(rule.from), rule.to);
    return (applied === url) ? false : applied;
  }) && applied;
}

async function debugTime(name, fn) {
  const start = performance.now();
  const res = await Promise.resolve(fn());
  const end = performance.now();
  const duration = Math.floor(end - start);
  debug(`https-upgrade: ${name} took ${duration}ms`);
  return res;
}

// ======================================== //
//                  Stored                  //
// ======================================== //

/**
 * Retrieve the stored rulesets from storage.local
 *
 * Break into multiple operations to avoid locking up the background thread
 *
 * @returns {*} rulesets
 */
export async function getStoredRulesets(storageCount) {
  // validate storageCount
  if (!storageCount || Number.isNaN(Number(storageCount))) {
    throw new Error('invalid storage count value');
  }
  // generate keys
  const storageKeys = Array.from(new Array(Number(storageCount)).keys())
    .map((i) => { return STORAGE_TEMPLATE.replace('%s', i); });
  // for each key, generate op to retrieve part from storage
  const ops = storageKeys.map((key) => {
    return async () => {
      const part = await new Promise((resolve, reject) => {
        chrome.storage.local.get(
          key,
          (data) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            }
            else {
              resolve(data[key]);
            }
          },
        );
      });
      // yield to event loop
      await timer(5);

      return part;
    };
  });
  return debugTime('stage e', async () => {
    // perform ops consecutively
    const parts = [];
    for (const op of ops) {
      parts.push(await op());
    }

    return parts;
  });
}

/**
 * Store the rulesets in storage.local
 *
 * Break up the operations by parts to avoid locking up the background thread
 *
 * @param {Array} parts Storage payload
 * @param {number} oldCount Previous parts length
 */
export async function setStoredRulesets(parts, oldCount) {
  // create ops to push each part into storage
  const addOps = parts.map((part, i) => {
    return async () => {
      await new Promise((resolve, reject) => {
        chrome.storage.local.set(
          { [STORAGE_TEMPLATE.replace('%s', i)]: part },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            }
            else {
              resolve();
            }
          },
        );
      });
      // yield to event loop
      await timer(5);
    };
  });

  const act = async () => {
    await debugTime('stage d (delete)', async () => {
      const oldCountNum = Number(oldCount);
      // delete excess parts in storage
      if (!Number.isNaN(oldCountNum) && oldCountNum > parts.length) {
        const keys = [...Array(oldCountNum - parts.length).keys()]
          .map((i) => { return i + parts.length; })
          .map((i) => { return STORAGE_TEMPLATE.replace('%s', i); });
        await new Promise((resolve) => {
          chrome.storage.local.remove(keys, () => {
            if (chrome.runtime.lastError) {
              const err = chrome.runtime.lastError;
              debug(`https-upgrade/rulesets#setStoredRulesets: failed to remove with "${err}"`);
            }

            else { resolve(); }
          });
        });
      }
    });

    await debugTime('stage d (add)', async () => {
      // perform each add op consecutively
      for (const op of addOps) {
        // eslint-disable-next-line no-await-in-loop
        await op();
      }
    });
  };

  try {
    await act();
  }
  catch (err) {
    debug('https-upgrade/rulesets: stage d (store rulesets) failed');
    reportError('https-upgrade/rulesets', err);
    debug('https-upgrade/rulesets: retry storing rulesets...');
    await timer(5000);
    await act();
    debug('https-upgrade/rulesets: successfully stored rulesets');
  }
}

// ======================================== //
//                  Hosted                  //
// ======================================== //

export async function getTimestamp(channel) {
  const url = `${channel.urlPrefix}${LATEST_TIMESTAMP_FILE}`;
  const res = await debugTime('stage a', () => {
    return http.get(url);
  });
  if (!res.ok) { throw res; }
  const text = await res.text();
  const trimmed = text.trim();
  if (Number.isNaN(Number(trimmed))) {
    throw new Error('timestamp is not a number');
  }
  return trimmed;
}

async function getBuffer(channel) {
  const rulesFileUrl = `${channel.urlPrefix}${RULESET_FILE_TEMPLATE}`;
  try {
    return await http.get(rulesFileUrl).then((r) => { return r.arrayBuffer(); });
  }
  catch (err) {
    throw new Error('failed to fetch buffers');
  }
}

/**
 * Extract a compressed buffer
 *
 * Uses WebWorker because pako#inflate does not offer async API
 */
async function extract(rulesBuffer) {
  // Get url (same as ./worker.js file)
  const url = chrome.runtime.getURL('js/https-upgrade-worker.js');
  const worker = new Worker(url);
  const reqID = 0;
  return new Promise((resolve) => {
    worker.addEventListener('message', (e) => {
      const { data: { payload, type } } = e;
      if (type === MessageType.EXTRACT_RES && payload.reqID === reqID) {
        const { extracted } = payload;
        worker.terminate();
        resolve(extracted);
      }
    });
    worker.postMessage({
      type: MessageType.EXTRACT_REQ,
      payload: {
        rulesBuffer,
        reqID,
      },
    });
  });
}

/**
 * Fetch the rulesets from specified channel
 *
 * @returns {*} results
 * @returns {number} results.timestamp
 * @returns {*} results.rulesets
 */
export async function getHostedRulesets(channel) {
  try {
    const buffer = await debugTime('stage b', () => {
      return getBuffer(channel);
    });
    let { rulesets } = await debugTime('stage c', () => {
      return extract(buffer);
    });

    // Convert exclusions
    rulesets = rulesets.map((ruleset) => {
      const { exclusion } = ruleset;
      if (Array.isArray(exclusion)) {
        return Object.assign({}, ruleset, {
          exclusions: new RegExp(exclusion.join('|')),
          exclusion: undefined,
        });
      }
      if (exclusion) {
        debug('https-upgrade/index.js: failed to convert exclusion');
        debug(JSON.stringify(ruleset));
      }
      return ruleset;
    });

    // break into parts
    const parts = [];
    while (rulesets.length) {
      parts.push(rulesets.splice(0, PART_SIZE));
    }

    return parts;
  }
  catch (err) {
    debug(err.message || err.cause || err);
    throw err;
  }
}

// ======================================== //
//                  Local                   //
// ======================================== //

/**
 * Convert list of rules to map of (target, ruleset) pairs
 *
 * @param {Array} parts
 *
 * @returns {Map}
 */
export async function partsToTargetMap(parts) {
  const map = new Map();
  const ops = parts.map((part) => {
    return async () => {
      part.forEach((ruleset) => {
        if (!Array.isArray(ruleset.target)) {
          debug('https-rules: rule missing target array');
        }
        else {
          for (const target of ruleset.target) {
            if (!map.has(target)) {
              map.set(target, new Set());
            }
            map.get(target).add(ruleset);
          }
        }
      });
      // yield to event loop (to prevent locking up background)
      // eslint-disable-next-line no-await-in-loop
      await timer(5);
    };
  });
  await debugTime('stage f', async () => {
    for (const op of ops) {
      await op();
    }
  });
  return map;
}
