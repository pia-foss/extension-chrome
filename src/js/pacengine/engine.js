/* eslint-disable
    consistent-return,
    no-bitwise,
    no-plusplus,
    no-restricted-syntax,
    no-underscore-dangle,
    no-unused-vars,
    no-use-before-define,
*/
const config = require('./config');
const util = require('./util');

const data = {
  localDomains: config.get().localDomains,
  nodeOverrides: config.get().nodeOverrides,
  IPv4NotationRE: /^\d+\.\d+\.\d+\.\d+$/g,
  localIPsRE: /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)/
};

module.exports = {
  data,
  // Merge additional hosts from ruleOverrides into rules based on the domain.
  mergeRuleOverrides(rules, overrides) {
    if (!((rules ? rules.length : undefined) > 0)) {
      return [];
    }
    if (!((overrides ? overrides.length : undefined) > 0)) {
      return rules;
    }
    for (const rule of rules) {
      for (const override of overrides) {
        if (override.domains.indexOf(rule.domain) > -1) {
          // We have a match, concatenate hosts with de-duplication
          rule.hosts = util.concatUnique(
            rule.hosts || [],
            override.hosts || []
          );
        }
      }
    }
    return rules;
  },

  /* Helper functions used by us and and the proxy pacscript */
  // Returns a concatenated string of proxy nodes based on country code
  nodeLookup(nodeDict, cc) {
    return nodeDict[cc] || false;
  },
  // Helper function to compare a host against an array of hosts with matchWildcardDomain
  compareHosts(hosts, host) {
    for (const h of hosts) {
      if (this.matchWildcardDomain(host, h)) {
        return h;
      }
    }
  },
  // Helper function to compare a URL against an array of regexp URL patterns
  compareURLs(patterns, url) {
    for (const p of patterns) {
      if (p.test(url)) {
        return p;
      }
    }
  },
  // WARNING: The pattern facebook.com will match the host fakefacebook.com
  // It's safer to use matchWildcardDomain instead.
  dnsDomainIs(host, pattern) {
    return (
      host.length >= pattern.length &&
      host.substring(host.length - pattern.length) === pattern
    );
  },
  // To make it easier for users we match all subdomains of a domain as well
  // E.g. the host images.facebook.com does match if the domain is facebook.com
  // NOTE: See here before optimizing: http://codepen.io/berstend/pen/wBjBaL
  matchWildcardDomain(host, domain) {
    const exactMatch = host === domain;
    // Check if the host ends with the supplied domain
    const tldMatch = host.slice(-domain.length) === domain;
    // Check if the character before the domain is a dot
    const hasSubdomain = host[host.lastIndexOf(domain) - 1] === '.';
    return exactMatch || (tldMatch && hasSubdomain);
  },

  // Returns alternative proxy nodes (e.g. 'US-ALT1') if an override is matching the location and host.
  matchNodeOverride(host, cc) {
    const result = this.data.nodeOverrides.find(
      o => o.target_cc === cc && this.compareHosts(o.hosts, host)
    );
    return result ? result.nodes : false;
  },
  // Generic support for custom, user defined rules
  // Returns the index of the rule if there there is a match
  matchRules(rules, host, url) {
    if (!rules || !rules.length) {
      return;
    }
    // In exportPAC we pre-populate rulesWithOverrides for speed reasons, we don't during background usage.
    // Again: The following assignment is not executed in the proxy.pac context.
    if (!this.data.rulesWithOverrides) {
      rules = this.mergeRuleOverrides(rules, config.get().ruleOverrides);
    }
    // Loop through all rules and check if they match
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (
        this.matchWildcardDomain(host, rule.domain) ||
        (rule.hosts && this.compareHosts(rule.hosts, host))
      ) {
        return i;
      }
    }
  },
  // NOTE: We start simple and only support domain and host matching for now.
  // or (url? and @compareURLs(rule.urls, url)))
  // and not (rule.excludes and @compareURLs(rule.excludes, url))

  /*
    _getProxyState is the main function determining the proxy state of a given url and host.
    @param {string} url URL to test (rarely used)
    @param {string} host Host to test
    @param {array} rules The user defined custom rules
    @return {string} LOCAL, DIRECT, DEFAULT or $COUNTRYCODE (e.g. DE or OFF)
  */
  _getProxyState(url, host, rules) {
    // No need to lowercase host, see http://findproxyforurl.com/misconceptions/
    url = url.toLowerCase();

    // Reset the lastIndex regex property which is cached for subsequent calls
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex
    this.data.IPv4NotationRE.lastIndex = 0;
    this.data.localIPsRE.lastIndex = 0;

    // Custom IPv6 compatible isPlainHostName replacement functionality
    // Returns true if host is not an IP nor FQDN, e.g. http://intranet
    if (!~host.indexOf('.') && !~host.indexOf(':')) {
      return 'LOCAL';
    }

    // Check if host is a local IPv4 address
    if (
      this.data.IPv4NotationRE.test(host) &&
      this.data.localIPsRE.test(host)
    ) {
      return 'LOCAL';
    }

    for (const local of this.data.localDomains) {
      if (this.matchWildcardDomain(host, local)) {
        return 'LOCAL';
      }
    }

    const match = this.matchRules(rules, host, url);
    if (Number.isInteger(match)) {
      return rules[match].cc
    }
    return 'DEFAULT';
  }
};
