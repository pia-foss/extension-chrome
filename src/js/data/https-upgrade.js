// ======================================== //
//                Messaging                 //
// ======================================== //

export const MessageType = {
  EXTRACT_REQ: 'extract',
  EXTRACT_RES: 'extract_response',
};

// ======================================== //
//                  Files                   //
// ======================================== //

export const LATEST_TIMESTAMP_FILE = 'eff.default.ruleset.timestamp';
export const RULESET_FILE_TEMPLATE = 'eff.default.ruleset.latest.gz';

// ======================================== //
//               Storage Keys               //
// ======================================== //

const STORAGE_PREFIX = 'https-upgrade';

export const LAST_UPDATED_KEY = `${STORAGE_PREFIX}::last-updated`;
export const LAST_TIMESTAMP_KEY = `${STORAGE_PREFIX}::last-timestamp`;
export const STORAGE_TEMPLATE = `${STORAGE_PREFIX}::%s`;
export const STORAGE_COUNT_KEY = `${STORAGE_PREFIX}::storage-count`;

// ======================================== //
//                 Channels                 //
// ======================================== //

export const channels = [
  {
    name: 'default',
    urlPrefix: 'https://s3.amazonaws.com/privateinternetaccess/',
  },
];

// ======================================== //
//                  General                 //
// ======================================== //

export const COUNTER_LIMIT = 6;
export const PART_SIZE = 500;
export const ALARM_NAME = 'PollHttpsRules';
