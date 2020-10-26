const { fn } = jest;

const named = (name) => { return fn().mockName(name); };

function createMock() {
  return {
    alarms: {
      create: named('alarms#create'),
      get: named('alarms#get'),
      getAll: named('alarms#getAll'),
      clear: named('alarms#clear'),
      onAlarm: {
        addListener: named('alarms#onAlarm#addListener'),
        removeListener: named('alarms#onAlarm#removeListener'),
      },
    },
    browserAction: {
      setIcon: named('browserAction#setIcon'),
      setBadgeText: named('browserAction#setBadgeText'),
      getBadgeText: named('browserAction#getBadgeText'),
      setBadgeBackgroundColor: named('browserAction#setBadgeBackgroundColor'),
      getBadgeBackgroundColor: named('browserAction#getBadgeBackgroundColor'),
      enable: named('browserAction#enable'),
      disable: named('browserAction#disable'),
    },
    cookies: {
      set: named('cookies#set'),
    },
    runtime: {
      getURL: named('runtime#getURL'),
    },
    storage: {
      local: {
        get: named('storage#local#get'),
        set: named('storage#local#set'),
        remove: named('storage#local#remove'),
      },
    },
  };
}

export default createMock;
