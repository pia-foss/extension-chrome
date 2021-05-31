/* eslint indent: 0 */

/*
 * Configuration for webpack build process
 *
 * The configuration uses the builder pattern
 * in order to configure the build using typical
 * control flow, due to the many variations in
 * the build process
 */

const dotenv = require('dotenv');
const ExtractCssPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');
const Config = require('webpack-chain');

dotenv.config();

const {
  ZipPlugin,
  PackPlugin,
  MovePlugin,
  GitInfoPlugin,
  PublishPlugin,
  ReporterPlugin,
  ChangelogPlugin,
  BrowserInfoPlugin,
  ExtensionManifestPlugin,
} = require('./webpack/plugins');
const {
  env,
  src,
  root,
  dist,
  Build,
  print,
  getBuild,
  getBrowser,
  getAliases,
  getVersion,
  shouldRelease,
  getExtensions,
} = require('./webpack/util');
const Environment = require('./webpack/environment');

// initialize builders
const config = new Config();
const environments = new Environment();

// ----------------- Common Config ----------------- //

config
  /* target web */
  .target('web')
  /* main entry points */
  .entry('foreground')
    .add(src('jsx', 'app', 'index.jsx'))
    .end()
  .entry('background')
    .add(src('js', 'background.js'))
    .end()
  /* popups */
  .entry('importrules')
    .add(src('js', 'popups', 'importrules.js'))
    .end()
  /* error pages */
  .entry('connfail')
    .add(src('js', 'errorpages', 'connfail.js'))
    .end()
  .entry('authfail')
    .add(src('js', 'errorpages', 'authfail.js'))
    .end()
  /* workers */
  .entry('https-upgrade-worker')
    .add(src('js', 'util', 'https-upgrade', 'worker.js'))
    .end()
  /* output files to dist */
  .output
    .path(dist())
    .filename('[name].js')
    .publicPath('/')
    .end()
  /* disable some performance (unnecessary for extension, no network) */
  .performance
    .hints(false)
    .end()
    .stats({
      all: false,
      errors: true,
      errorDetails: true,
      timings: true,
      warnings: true,
    })
  /* setup extensions */
  .resolve
    .extensions
      .merge(getExtensions())
      .end()
    .end()
  /* loaders */
  .module
    /* javascript (babel) */
    .rule('javascript')
      .test(/\.m?jsx?$/)
      .exclude
        .add(/node_modules/)
        .end()
      .use('babel')
        .loader('babel-loader')
        .end()
      .end()
    /* sass */
    .rule('scss')
      .test(/\.scss$/)
      .use('extract css loader')
        .loader(ExtractCssPlugin.loader)
        .end()
      .use('css loader')
        .loader('css-loader')
        .end()
      .use('postcss loader')
        .loader('postcss-loader')
        .end()
      .use('sass loader')
        .loader('sass-loader')
        .end()
      .end()
    /* css (for locales, libraries */
    .rule('css')
      .test(/\.css$/)
      .use('css loader')
        .loader('css-loader')
        .end()
      .use('postcss loader')
        .loader('postcss-loader')
        .end()
      .use('sass loader')
        .loader('sass-loader')
        .end()
      .end()
    /* images */
    .rule('images')
      .test(/\.(png|jpg|gif|svg)$/)
      .use('file loader')
        .loader('file-loader')
        .options({
          name: '[name].[ext]',
          outputPath: 'files',
        })
        .end()
      .end()
    .end()
  /* report when build completes */
  .plugin('reporter')
    .use(ReporterPlugin, [])
    .end()
  /* cleanup before build */
  .plugin('clean')
    .use(CleanWebpackPlugin, [
      [dist()],
      { root: root() },
    ])
    .end()
  /* copy necessary files to dist after build */
  .plugin('copy')
    .use(CopyPlugin, [[
      {
        from: src('images'),
        to: dist('images'),
      },
      {
        from: src('_locales'),
        to: dist('_locales'),
      },
      {
        from: src('html'),
        to: dist('html'),
      },
      {
        from: src('css', 'locales'),
        to: dist('css', 'locales'),
      },
      {
        from: src('fonts'),
        to: dist('fonts'),
      },
    ]])
    .end()
  /* generate browser manifest from template */
  .plugin('manifest')
    .use(ExtensionManifestPlugin, [{
      template: src(`manifest.${getBrowser()}.json`),
      version: getVersion(),
    }])
    .end()
  /* extract css from js files */
  .plugin('extract css')
    .use(ExtractCssPlugin, [{
      filename: '[name].css',
      chunkFilename: '[id].css',
    }])
    .end()
  /* generate changelog.md file */
  .plugin('changelog')
    .use(ChangelogPlugin, [{
      source: root('CHANGELOG.md'),
    }])
    .end()
  /* move files after build */
  .plugin('move')
    .use(MovePlugin, [
      {
        dir: 'css',
        extension: 'css',
      },
      {
        dir: 'css',
        extension: 'css.map',
      },
      {
        dir: 'js',
        extension: 'js',
      },
      {
        dir: 'js',
        extension: 'js.map',
      },
      {
        dir: 'html',
        extension: 'html',
      },
    ])
    .end()
  .end();

// --------------------- Aliases --------------------- //

getAliases('webpack')
  .forEach(([aliasTarget, aliasPath]) => {
    config
      .resolve
        .alias
          .set(aliasTarget, aliasPath);
  });

// --------------- Common Environments --------------- //

environments
  .set('BUILD_DATE', new Date().toUTCString())
  .set('BUILD_NAME', getBuild())
  .set('BROWSER_NAME', getBrowser())
  .set('PIA_VERSION', getVersion())
  .set('COUPON', 'PIACHROME');

// ----------------- Build Specific ----------------- //

const build = getBuild();

// ------------------ Development ------------------- //

if (build === Build.DEVELOPMENT) {
  config
    .mode('development')
    .devtool('inline-source-map')
    .end();
}

// ------------------- Bugfixes -------------------- //

if (build === Build.DEVELOPMENT || build === Build.QA) {
  environments
    .set('OVERRIDE_CLOSE_FOREGROUND', true);
}
else {
  environments
    .set('OVERRIDE_CLOSE_FOREGROUND', false);
}

// ---------------- Non-Development ----------------- //

if (build !== Build.DEVELOPMENT) {
  config
    .mode('production')
    .devtool('source-map')
    .optimization
      .minimize(false)
      .end()
    .end();
}

// ---------------------- E2E ---------------------- //

if (build === Build.E2E) {
  if (!process.env.MANIFEST_KEY) {
    throw new Error('e2e build requires MANIFEST_KEY to be set');
  }
  config
    .plugin('manifest')
      .tap(([opts]) => {
        return [Object.assign({}, opts, {
          properties: {
            key: process.env.MANIFEST_KEY,
          },
        })];
      })
      .end()
    .end();
}

// ------------------ Freeze App ------------------- //

if (build === Build.DEVELOPMENT || build === Build.E2E) {
  environments
    .set('FREEZE_APP', false);
} else {
  environments
    .set('FREEZE_APP', true);
}

// ------------------- GITINFO --------------------- //

if (build === Build.DEVELOPMENT || build === Build.QA) {
  config
    .plugin('gitinfo')
      .use(GitInfoPlugin)
      .end()
    .end();
}

// -------------------- Pack ---------------------- //
// -------------------- Pack ---------------------- //
if(getBrowser() == 'firefox'){
  if (build === Build.BETA || build === Build.QA || build === Build.E2E) {
    config
      .plugin('pack')
        .use(PackPlugin, [{
          apiKey: env('FIREFOX_KEY'),
          apiSecret: env('FIREFOX_SECRET'),
        }])
        .end()
      .end();
  }
  else if (build === Build.PUBLIC) {
    config
      .plugin('pack')
        .use(PackPlugin, [{
          apiKey: env('FIREFOX_KEY'),
          apiSecret: env('FIREFOX_SECRET'),
          // Don't want to include [build] (default behaviour)
          filename: 'private_internet_access-[browser]-v[version].[ext]',
        }])
        .end()
      .end();
  }
}else{
  if (build === Build.QA) {
    config
      .plugin('pack')
        .use(PackPlugin, [{
          useWebstoreKey: shouldRelease(),
          webstoreKey: root('webstore.pem'),
        }])
        .end()
      .end();
    }
  
  else if (build === Build.PUBLIC) {
    config
      .plugin('pack')
        .use(PackPlugin, [{
          useWebstoreKey: shouldRelease(),
          webstoreKey: root('webstore.pem'),
          // Don't want to include [build] (default behaviour)
          filename: 'private_internet_access-[browser]-v[version].[ext]',
        }])
        .end()
      .end();
  }
}


// -------------------- Beta ---------------------- //

if (build === Build.BETA) {
  config
    .plugin('zip')
      .use(ZipPlugin, [
        {
          source: dist(),
          dir: dist('..'),
          filename: 'private_internet_access-[browser]-v[version]-[build].zip',
          hook: 'betaZip',
        },
      ])
      .end()
    .plugin('info')
      .use(BrowserInfoPlugin, [{
        zipHook: 'betaZip',
      }])
      .end()
    .end();
}

// ------------------- Release --------------------- //

if (shouldRelease()) {
  config
    .plugin('zip')
      .use(ZipPlugin, [
        {
          source: dist(),
          dist: dist('..'),
          filename: 'private_internet_access-[browser]-v[version].zip',
          hook: 'releaseZip',
        },
      ])
      .end()
    .plugin('publish')
      .use(PublishPlugin, [{
        keys: {
          clientId: env('WEBSTORE_CLIENT_ID'),
          clientSecret: env('WEBSTORE_CLIENT_SECRET'),
          refreshToken: env('WEBSTORE_REFRESH_TOKEN'),
        },
        id: env('WEBSTORE_PUBLIC_ID'),
        target: 'default',
        hook: 'releaseZip',
      }])
      .end()
    .end();
}

// ----------------- Environments ------------------ //

config
  .plugin('environment')
    .use(DefinePlugin, [environments.export()]);


// ---------------- Print Override ----------------- //

if (env('PRINT_CONFIG') === String(true)) {
  print(JSON.stringify(config.toConfig(), null, 4));
  process.exit();
}

module.exports = config.toConfig();
