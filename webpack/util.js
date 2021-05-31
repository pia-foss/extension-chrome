const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const env = (envVar) => {
  return process.env[envVar];
};
exports.env = env;

/**
 * Colors used for console statements
 */
const Color = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
};
exports.Color = Color;

/**
 * Used to print colors to console
 */
// eslint-disable-next-line no-console
const print = (msg, color = Color.blue) => { console.log(`${color}%s\x1b[0m`, msg); };
exports.print = print;

/**
 * Determine the browser for the build
 *
 * Uses environment variable "BROWSER"
 */
const getBrowser = () => { 
  return process.env.BROWSER || 'chrome'; };
exports.getBrowser = getBrowser;

/**
 * Possible build types
 */
const Build = {
  DEVELOPMENT: 'dev',
  QA: 'qa',
  E2E: 'e2e',
  BETA: 'beta',
  PUBLIC: 'public',
};
exports.Build = Build;

/**
 * Determines type of build
 *
 * Uses environment variable "BUILD"
 */
const getBuild = () => {
  const build = process.env.WEBPACK_ENV || Build.DEVELOPMENT;
  switch (build) {
    case Build.DEVELOPMENT:
    case Build.QA:
    case Build.E2E:
    case Build.PUBLIC:
    case Build.BETA:
      return build;

    default: throw new Error(`invalid build: ${build}`);
  }
};
exports.getBuild = getBuild;

/**
 * Determine from the build whether it is a release build or not
 */
const shouldRelease = () => {
  const build = getBuild();
  return (
    process.env.PIA_RELEASE === String(true)
    && build === Build.PUBLIC
  );
};
exports.shouldRelease = shouldRelease;

/**
 * Derive a path from root
 */
const root = (...filesOrDirs) => { return path.resolve(__dirname, '..', ...filesOrDirs); };
exports.root = root;

/**
 * Derive a path from src
 */
const src = (...filesOrDirs) => { return root('src', ...filesOrDirs); };
exports.src = src;

/**
 * Determine a path for the build directory
 */
const getBuildDirName = () => {
  const browser = getBrowser();
  const build = getBuild();
  return `${browser}-${build}`;
};
exports.getBuildDirName = getBuildDirName;

/**
 * Derive a path from dist
 */
const dist = (...filesOrDirs) => {
  return root('builds', getBuildDirName(), ...filesOrDirs);
};
exports.dist = dist;

/**
 * Get the current version of the extension
 */
const getVersion = () => {
  if (!getVersion.version) {
    const versionPath = root('VERSION');
    const versionFile = fs.readFileSync(versionPath, 'utf8');
    getVersion.version = versionFile.trim();
  }

  return getVersion.version;
};
exports.getVersion = getVersion;

/**
 * Get browser-specific file extensions for source files
 */
const getExtensions = (config = 'webpack') => {
  let prefixes;
  switch (getBrowser()) {
    case 'opera': {
      prefixes = [
        'op',
        'ch',
      ];
      break;
    }
    case 'chrome': {
      prefixes = [
        'ch',
      ];
      break;
    }
    case 'firefox': {
      prefixes = [
        'ff',
      ];
      break;
    }
    default: {
      // for eslint
      prefixes = [
        'ch',
        'op',
        'ff',
      ];
      break;
    }
  }

  const extensions = prefixes
    .map((prefix) => {
      return [
        `${prefix}.js`,
        `${prefix}.jsx`,
        `${prefix}.scss`,
      ];
    })
    .reduce((a, b) => {
      return [...a, ...b];
    })
    .concat(['js', 'jsx', 'scss']);

  switch (config) {
    case 'webpack': {
      return extensions.map((ext) => { return `.${ext}`; });
    }
    case 'jest': {
      return extensions;
    }
    default: throw new Error(`No alias format for config: ${config}`);
  }
};
exports.getExtensions = getExtensions;


/**
 * Determine current git hash
 */
const getGitHash = () => {
  return execSync('git rev-parse HEAD', { cwd: root() })
    .toString()
    .trim();
};
exports.getGitHash = getGitHash;

/**
 * Determine current git branch name
 */
const getGitBranch = () => {
  return execSync('git rev-parse --abbrev-ref HEAD', { cwd: root() })
    .toString()
    .trim();
};
exports.getGitBranch = getGitBranch;

/**
 * Determine browser-specific file extension for distributables
 */
const getExt = (browser = getBrowser()) => {
  switch (browser) {
    case 'chrome': {
      return 'crx';
    }
    case 'opera': {
      return 'crx';
    }
    case 'firefox': {
      return 'xpi';
    }
    default: throw new Error(`invalid browser: ${browser}`);
  }
};
exports.getExt = getExt;

/**
 * Format filename for distributables, filling in variables
 *
 * [browser]
 * [version]
 * [build]
 * [ext]
 */
const formatFilename = (template) => {
  if (!template) { return ''; }
  const browser = getBrowser();
  return template
    .replace('[browser]', browser)
    .replace('[version]', getVersion())
    .replace('[build]', getBuild())
    .replace('[ext]', getExt(browser));
};
exports.formatFilename = formatFilename;

/**
 * Get default filename for distributables
 */
const defaultFilename = () => {
  return formatFilename('private_internet_access-[browser]-v[version]-[build].[ext]');
};
exports.defaultFilename = defaultFilename;

/**
 * Get aliases for directories
 */
const getAliases = (config = 'webpack') => {
  const aliases = [
    ['@core', ['src', 'js', 'core']],
    ['@root', []],
    ['@src', ['src']],
    ['@style', ['src', 'scss']],
    ['@images', ['src', 'images']],
    ['@util', ['src', 'js', 'util']],
    ['@pacengine', ['src', 'js', 'pacengine']],
    ['@helpers', ['src', 'js', 'helpers']],
    ['@popups', ['src', 'js', 'popups']],
    ['@chromesettings', ['src', 'js', 'chromesettings']],
    ['@firefoxsettings', ['src', 'js', 'firefoxsettings']],
    ['@contentsettings', ['src', 'js', 'contentsettings']],
    ['@eventhandler', ['src', 'js', 'eventhandler']],
    ['@mockapp', ['src', 'js', 'mockapp']],
    ['@app', ['src', 'jsx', 'app']],
    ['@data', ['src', 'js', 'data']],
    ['@errorpages', ['src', 'js', 'errorpages']],
    ['@pages', ['src', 'jsx', 'pages']],
    ['@contexts', ['src', 'jsx', 'contexts']],
    ['@routes$', ['src', 'jsx', 'routes', 'index.jsx']],
    ['@component', ['src', 'jsx', 'component']],
    ['@hoc', ['src', 'jsx', 'hoc']],
    ['@unit', ['test', 'unit']],
    ['@mocks', ['test', 'unit', 'mocks']],
  ];

  switch (config) {
    case 'webpack': {
      return aliases
        .map(([key, value]) => {
          return [key, root(...value)];
        });
    }
    case 'jest': {
      return aliases
        .map(([key, value]) => {
          let aliasTarget;
          let aliasPath;
          if (key.endsWith('$')) {
            aliasTarget = key;
            aliasPath = ['<rootDir>', ...value].join('/');
          }
          else {
            aliasTarget = `${key}(.*)$`;
            aliasPath = `${['<rootDir>', ...value].join('/')}$1`;
          }
          return [aliasTarget, aliasPath];
        });
    }
    default: throw new Error(`No alias format for config: ${config}`);
  }
};
exports.getAliases = getAliases;
