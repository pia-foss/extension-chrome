/* eslint-disable
    default-case,
    func-names,
    no-restricted-syntax,
    no-underscore-dangle,
*/

const config = require('./config');
const util = require('./util');
const engine = require('./engine');
const log = require('loglevel');
const { classof } = require('core-js/fn/object');

/*
  Helper functions and exports
*/

// We need to jump through some hoops in order to stringify the engine correctly
const serializeEngineToString = function(e) {
  e = e || engine;
  const res = [];
  for (const k of Object.keys(e)) {
    const v = e[k];
    const strV = v.toString();
    switch (typeof e[k]) {
      // We need to serialize different property types differently.
      case 'function':
        strV.startsWith('function')
          ? res.push(`${k}: ${strV}`)
          : res.push(`${k}: function ${strV}`);
        break;
      case 'object':
        res.push(`${k}: ${JSON.stringify(e[k])}`);
        break;
    }
  }
  return `{ ${res.join(',')} }`; // Wrap engine contents in object literal
};

// NOTE: Regexp don't survive JSON.stringify correctly
// See: http://stackoverflow.com/questions/12075927/serialization-of-regexp
// We have to issue toString() on them when exporting and not put them in quotes.
const pacScriptRegexp = `\
e.data.IPv4NotationRE = ${engine.data.IPv4NotationRE.toString()};
e.data.localIPsRE = ${engine.data.localIPsRE.toString()};\
`;

// Export complete stringified proxy.pac
// The pac script needs to be self-contained as it cannot access outside data.
// NOTE: You can eval and test the behaviour in your console using this:

exports.exportPAC = function(defaultLocation, nodeDict, rules, pageExcludes) {
  rules = rules || [];
  pageExcludes = pageExcludes || [];

  log.debug('pacengine.exportPAC', {
    defaultLocation,
    nodeDict,
    rules,
    pageExcludes
  });
  const pac = `\
/*Private Internet Access*/
function FindProxyForURL(url, host) {
  var e = ${serializeEngineToString()};
  e.data.localDomains = e.data.localDomains.concat(${JSON.stringify(
    pageExcludes
  )});
  ${pacScriptRegexp}

  e.data.defaultLocation = '${defaultLocation}';
  e.data.nodeDict = ${JSON.stringify(nodeDict)};
  e.data.rulesWithOverrides = ${JSON.stringify(
    engine.mergeRuleOverrides(rules, config.get().ruleOverrides)
  )};

  var res = e._getProxyState(url, host, e.data.rulesWithOverrides);
  var cc;
  if (res === 'LOCAL' || res === 'DIRECT' || res === 'OFF') {return 'DIRECT'};
  if (res === 'DEFAULT') {cc = e.data.defaultLocation} else {cc = res};
  var override = e.matchNodeOverride(host, cc);
  if (override) {cc = override};
  return e.nodeLookup(e.data.nodeDict, cc) || 'DIRECT';
}\
`;
  return pac;
};

// Returns LOCAL, DIRECT, DEFAULT or $COUNTRYCODE for a given URL and host.
// $COUNTRYCODE (can be "OFF") is only being returned if a custom rule did match.
// Meant for internal consumption to communicate proxy state to the user.
exports.getProxyStateByURL = function(url, host, rules) {
  rules = rules || [];
  host = host || util.parseURL(url).host || url;
  return engine._getProxyState(url, host, rules);
};

// Returns a lookup dictionary with country codes and respective concatenated proxy nodes.
// e.g. {"GB":"HTTPS 8.8.8.8:443;HTTPS 8.8.8.9:443","US":"HTTPS 2.2.2.2:443"}
// parameter noExtras removes the HTTPS and port appendix
exports.getNodeDictFromLocations = function(
  locations,
  key
) {
    const nodeDict = {};
    locations.map(node => {
        const {host,id} = node;
        const port = node[key];
        nodeDict[id] = typeof browser == 'undefined' ? `HTTPS ${host}:${port}` : `${host}:${port}`;
    });
  return nodeDict;
};

exports.matchRules = (rules, host, url) => engine.matchRules(rules, host, url);
