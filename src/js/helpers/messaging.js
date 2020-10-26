/*
  interface Meta {
    target: string;
    type: string;
  }

  type Listener <T> = (payload: T) => void;
*/

const Type = {
  FOREGROUND_OPEN: '@all/foreground_open',
};

const Target = {
  ALL: '@all',
  POPUPS: '@popups',
  FOREGROUND: '@foreground',
  BACKGROUND: '@background',
};

const validateMeta = (meta) => {
  if (typeof meta !== 'object') {
    throw new Error(`expected meta to be object, not ${typeof meta}`);
  }
  if (meta === null) {
    throw new Error('expected meta to be object, not null');
  }
  if (typeof meta.target !== 'string') {
    throw new Error('expected meta to contain string property "target"');
  }
  if (typeof meta.type !== 'string') {
    throw new Error('expected meta to contain string property "type');
  }
};

const isValidTarget = (listenerTarget, senderTarget) => {
  if (senderTarget === Target.ALL) {
    return true;
  }
  if (senderTarget === listenerTarget) {
    return true;
  }

  return false;
};

/**
 * Listen for messages
 *
 * @template T
 * @param {Meta} meta Metadata about message
 * @param {Listener<T>} listener Listener triggered when message is received
 *
 * @returns {void}
 */
const onMessage = (meta, listener) => {
  validateMeta(meta);
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === meta.type && isValidTarget(meta.target, message.target)) {
      listener(message.data);
    }
  });
};

/**
 * Send a message
 *
 * @template T
 * @param {Meta} meta Metadata about message
 * @param {T} [data] Payload to send
 *
 * @returns {void}
 */
const sendMessage = (meta, data) => {
  validateMeta(meta);
  const { target, type } = meta;
  chrome.runtime.sendMessage({
    target,
    type,
    data,
  });
};

export {
  onMessage,
  sendMessage,
  Type,
  Target,
};
