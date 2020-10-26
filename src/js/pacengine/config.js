// Built-in config

const log = require('loglevel');

const config = {
 
  connectionCheckDomains: [
    { url: 'http://www.google.com.sg/gen_204', code: 204 },
    { url: 'http://g.cn/generate_204', code: 204 },
    { url: 'http://www.thinkdifferent.us', code: 200 },
    { url: 'http://www.airport.us', code: 200 },
    { url: 'http://detectportal.firefox.com/success.txt', code: 200 },
    { url: 'http://captive.apple.com', code: 200 }
  ],
  localDomains: [
    // Our domains
    'd1jr1idae5ms9n.cloudfront.net',
    // Local network
    'local', // .local are often employed in private networks
    'ip', // speedport.ip is being used by telekom routers
    'fritz.box', // FRITZ!Box router settings
    'kabel.box', // Vodafone router settings
    'invalid', // https://en.wikipedia.org/wiki/.invalid
    'intra', // used by some companies for local intranet
    'intranet', // used by some companies for local intranet
    'test', // https://en.wikipedia.org/wiki/.test
    'example', // https://en.wikipedia.org/wiki/.example
    'localhost', // https://en.wikipedia.org/wiki/.localhost
    // Misc
    'onion', // Tor domains
    'i2p', // i2p domains
    // DNS that resolves to 127.0.0.1 (mostly for developers)
    'lvh.me',
    'vcap.me',
    '127.0.0.1.xip.io', // http://xip.io/
    'localtest.me', // http://readme.localtest.me/
    // Firefox local pages
    'about:addons',
    'about:newtab',
    'about:preferences',
    'about:config',
    'about:debugging'
  ],
  // we need this list to inform the user about conflicting extensions
  blackList: { 'jid1-4P0kohSJxU1qGg@jetpack': 'hola' },
  // This could come out of the API eventually
  alternativeNodes: [],
  // For some hosts it might be required to use alternative servers
  // Previously this only applies to hulu as they blocked the whole Leaseweb US DC.
  nodeOverrides: [],
  // In order to behave like the user would expect we use a ruleOverride list.
  // We're not able to have "tab based" proxy rules but rather host based rules.
  // If the user defines facebook.com in a rule he would expect to unblock all of Facebook,
  // unfortunately that's not the case as FB is using a multitude of additonal hosts for their service.
  // The following list is currently used only internally and not exposed to the user,
  // we might choose to expose this list later on to user editing when we advance the rule feature.
  ruleOverrides: [
    {
      domains: ['facebook.com'],
      hosts: [
        'facebook.net',
        'fbcdn.com',
        'fbcdn.net',
        'fbsbx.com',
        'fb.me',
        'fb.com',
        'fbsbx.com.online-metrix.net',
        'fbstatic-a.akamaihd.net',
        'fbcdn-dragon-a.akamaihd.net'
      ]
    },
    {
      domains: ['netflix.com'],
      hosts: ['nflxvideo.net']
    },
    {
      domains: ['bbc.co.uk', 'bbc.com'],
      hosts: [
        'bbc.co.uk',
        'bbc.com',
        'vod-dash-uk-live.akamaized.net',
        'vod-thumb-uk-live.akamaized.net'
      ]
    },
    {
      domains: ['speedtest.net'],
      hosts: ['ooklaserver.net']
    },
    {
      domains: ['speedtest.xfinity.com'],
      hosts: ['comcast.net']
    }
  ],
  // The following is a list of hosts for each of which we will close any tab
  // that tries to open a URL with that host
  blockedSites: ['appnord.xyz'],
  // For fixed_servers' bypassList and is taken from
  privateNetworks: [
    '0.0.0.0/8',
    '10.0.0.0/8',
    '127.0.0.0/8',
    '169.254.0.0/16',
    '192.168.0.0/16',
    '172.16.0.0/12',
    '::1',
    'localhost',
    '*.local'
  ]
};


// expose config to the console
if (typeof window !== 'undefined') {
  window.config = config;
}

module.exports = {
  get() {
    return config;
  }
};
