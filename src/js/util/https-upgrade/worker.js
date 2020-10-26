/*
 * HttpsUpgrade Worker
 *
 * The extraction of the rulesets is a blocking action that takes
 * a significant amount of time (considering the number of rulesets).
 * Using a worker to complete this operation prevents the background
 * "app" from locking up, which could potentially lead to the foreground
 * being locked up as well due to the use of
 * chrome#runtime#getBackgroundPage
 */

import pako from 'pako';

import { MessageType } from '@data/https-upgrade';

// eslint-disable-next-line import/prefer-default-export
export async function extract(rulesBuffer) {
  const compressed = Array.from(new Uint8Array(rulesBuffer))
    .map((b) => { return String.fromCharCode(b); })
    .join('');
  const uncompressed = pako.inflate(compressed);
  const decoded = new TextDecoder('utf-8').decode(uncompressed);
  return JSON.parse(decoded);
}

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (e) => {
  const { data: { type, payload } } = e;
  switch (type) {
    case MessageType.EXTRACT_REQ: {
      const { rulesBuffer, reqID } = payload;
      const extracted = await extract(rulesBuffer);
      postMessage({
        type: MessageType.EXTRACT_RES,
        payload: {
          extracted,
          reqID,
        },
      });
      return;
    }
    default: {
      throw new Error(`https-upgrade: worker invalid type ${type}`);
    }
  }
});
