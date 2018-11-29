// third party requirements
require('dotenv').config();
const fs = require('fs-extra');
const color = require('colors');
const echomd = require('echomd');
const Slack = require('node-slack');

const config = require('./config');
const webstoreConfigs = require('./config/webstorekeys');


// variables
let { gitinfo } = process.env; // eslint-disable-line no-process-env
const slack = new Slack(config.slack.hook, {});
const {
  build,
  freezeApp,
  audience,
  browser,
} = process.env; // eslint-disable-line no-process-env

// helper functions
const stringify = (s) => {
  return typeof(s) === "string" ? s : JSON.stringify(s);
};

const info = (s) => {
  echomd(`${color.yellow("INFO")}: ${stringify(s)}`);
};

const ok = (s) => {
  echomd(`${color.green("OK")}: ${stringify(s)}`);
};

const panic = (s) => {
  echomd(`${color.red("PANIC")}: ${stringify(s)}`);
  process.exit(1); // eslint-disable-line no-process-exit
};

const sendToSlack = (text, channels=['#qa-extension'], iconEmoji='robot_face') => {
  return new Promise((resolve, reject) => {
    if(process.env.slack === "no") { resolve(); } // eslint-disable-line no-process-env
    else {
      channels.forEach((channel) => {
        return slack.send({
          username: 'Private Internet Access bot',
          iconEmoji,
          text,
          channel
        }).finally(resolve);
      });
    }
  });
};


module.exports = function(grunt) {
  const browserName = browser;
  const pkgVersion = grunt.file.read('./VERSION').trim();
  const getZipPath = (buildname) => `./zips/private_internet_access-${browserName}-v${pkgVersion}.zip`;

  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-config');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-onesky-export');
  grunt.loadNpmTasks('grunt-onesky-import');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-purifycss');

  grunt.registerTask("build", "Builds the extension.", () => {
    if (browserName !== 'opera' && browserName !== 'chrome') {
      return panic("The $browser variable was not set, set $browser and rerun this task.");
    }

    let tasks = [];
    switch(build) {
      case "debug":
        tasks = ["env:debug", "config:debug", "gitinfo", "deletebuild", "createbuild", "babel", "replace", "sass", "browserify", "copyfiles", "changelog", "removeartifacts"];
        break;
      case "webstore":
        tasks = ["env:webstore", "config:webstore", "gitinfo", "deletebuild", "createbuild", "babel", "replace", "sass", "browserify", "copyfiles",
                     "purifycss", "changelog", "removeartifacts"];
        break;
      default:
        return panic("The build name was not set, set $build and then rerun this task.");
    }
    grunt.task.run(tasks);
  });

  grunt.registerTask("default", "build");

  grunt.registerTask("release", ["setreleaseenv", "build", "createzip", "compress", "webstorepublish"]);

  grunt.freezeApp = () => { return freezeApp !== "0"; };

  grunt.getCommit = () => {
    if(["yes", "1", "true"].includes(gitinfo)) {
      return grunt.config.get('gitinfo').local.branch.current.SHA;
    }
  };

  grunt.getBranch = () => {
    if(["yes", "1", "true"].includes(gitinfo)) {
      return grunt.config.get('gitinfo').local.branch.current.name;
    }
  };

  grunt.zipName = () => { return getZipPath(build); };

  grunt.registerTask("setreleaseenv", "Set release env vars", () => {
    const empty = (s) => !s || (s.trim && s.trim().length === 0);
    if(audience === "internal" && empty(gitinfo)) { gitinfo = "yes"; }
  });

  grunt.registerTask("webstorepublish", "Publish extension on webstore", function() {
    const finished        = this.async();
    const webstoreKeys    = webstoreConfigs.keys;
    const webstoreTargets = {public: "default", internal: "trustedTesters"};
    const webstoreIDs     = webstoreConfigs.ids;
    const webstoreURL     = `https://chrome.google.com/webstore/detail/private-internet-access/${webstoreIDs[audience]}`;
    const webstore = require('chrome-webstore-upload')(Object.assign({extensionId: webstoreIDs[audience]}, webstoreKeys));

    const availableAnnoucement = (audience, webstoreURL) => {
      if(audience === "internal")
        return `New extension *v${pkgVersion}* published for *testers*.\n` +
               `URL: ${webstoreURL}\n` +
               `It can take up to 15 minutes to become available on the store.`;
      else
        return `New extension *v${pkgVersion}* published for *all PIA users*.\n` +
               `URL: ${webstoreURL}\n` +
               `It can take up to 15 minutes to become available on the store.`;
    };

    const pendingAnnoucement = (audience, webstoreURL) => {
      if(audience === "internal")
        return `New extension *v${pkgVersion}* published for *testers*\n` +
               `URL: ${webstoreURL}\n` +
               `It will be available on store after review, which can take up to 60 minutes.`;
      else
        return `New extension *v${pkgVersion}* published for *all PIA users*.\n` +
               `URL: ${webstoreURL}\n` +
               `It will be available on store after review, which can take up to 60 minutes.`;
    };

    const confirmPublish  = (res) => {
      if(res.status.indexOf("ITEM_PENDING_REVIEW") >= 0) {
        const msg = pendingAnnoucement(webstoreURL);
        sendToSlack(msg).then(() => ok(msg)).then(finished);
      } else if(res.status.indexOf("OK") >= 0) {
        const msg = availableAnnoucement(audience, webstoreURL);
        sendToSlack(msg).then(() => ok(msg)).then(finished);
      }
      else {
        panic(res);
        finished();
      }
    };

    const publishUpload = (res, token) => {
      if(res.uploadState !== 'SUCCESS') {
        return panic(res.itemError.map((e) => e.error_detail).join(","));
      }
      info(`Uploaded "${getZipPath(build)}". Please wait.`);
      webstore.publish(webstoreTargets[audience], token)
      .then(confirmPublish);
    };

    const uploadPackage = (token) => {
      webstore.uploadExisting(fs.createReadStream(getZipPath(build)), token)
      .then((res) => publishUpload(res, token));
    };

    grunt.task.requires("createzip");

    if(Object.keys(webstoreIDs).indexOf(audience) < 0) {
      return panic("$audience must be set to 'public' or 'internal'");
    }

    info("Starting upload");
    webstore.fetchToken().then(uploadPackage);
  });

  grunt.registerTask("changelog", "Convert CHANGELOG.md from markdown to HTML", () => {
    const marked    = require('marked');
    const changelog = grunt.file.read('./CHANGELOG.md');
    marked.setOptions({sanitize: false, smartypants: true, gfm: true});
    grunt.file.write(`${grunt.config.get('buildpath')}/html/CHANGELOG.html`, marked(changelog));
  });

  grunt.registerTask("createzip", "Builds the extension, and then creates a .zip file from the build directory.", () => {
    if(!build) {
      return panic("The build name was not set, set $build and then rerun this task.");
    }

    if(!browserName) {
      return panic("The $browser variable was not set, set $browser and then rerun this task.");
    }

    info("Building extension");
    fs.mkdirpSync('zips');
    info("Building zip archive");
  });

  grunt.registerTask("deletebuild", "Delete a build directory.", () => {
    return fs.removeSync(grunt.config.get('buildpath'));
  });

  grunt.registerTask("createbuild", "Create a build directory.", () => {
    return fs.mkdirpSync(grunt.config.get('buildpath'));
  });

  grunt.registerTask("copyfiles", "Copy static assets to a build directory.", () => {
    const buildPath = grunt.config.get('buildpath');

    switch(browserName) {
      case "opera":
        fs.copySync(buildPath + '/manifest.opera.json', buildPath + '/manifest.json');
        break;
      default:
        fs.removeSync(buildPath + '/manifest.opera.json');
        break;
    }

    fs.copySync('src/_locales', buildPath + '/_locales');
    fs.copySync('src/css', buildPath + '/css');
    fs.copySync('src/fonts', buildPath + '/fonts');
    fs.copySync('src/html', buildPath + '/html');
    fs.copySync('src/images', buildPath + '/images');
  });

  grunt.registerTask("removeartifacts", "Remove artifacts created during the build process.", () => {
    fs.removeSync('src/js/templates');
    fs.removeSync('src/js/component');
    fs.removeSync('src/js/hoc');
    fs.removeSync('tmp/');
  });
};
