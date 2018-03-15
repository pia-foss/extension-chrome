// third party requirements
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const color = require('colors');
const echomd = require('echomd');
const config = require('./config');
const Slack = require('node-slack');
const system = require("child_process").execSync;
const webstoreConfigs = require('./config/webstorekeys');

// variables
const slack = new Slack(config.slack.hook, {});
const browserName = process.env.browser; // eslint-disable-line no-process-env

// helper functions
const stringify = (s) => {
  return typeof(s) === "string" ? s : JSON.stringify(s);
}

const info = (s) => {
  echomd(`${color.yellow("INFO")}: ${stringify(s)}`);
}

const ok = (s) => {
  echomd(`${color.green("OK")}: ${stringify(s)}`);
}

const panic = (s) => {
  echomd(`${color.red("PANIC")}: ${stringify(s)}`);
  process.exit(1); // eslint-disable-line no-process-exit
}

const sendToSlack = (text, channels=['#pia-qa-extension'], iconEmoji='robot_face') => {
  return new Promise((resolve, reject) => {
    if(process.env.slack === "no") { resolve(); }
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
  })
}


module.exports = function(grunt) {
  const srcfiles = ["src/manifest.json", "src/_locales", "src/html", "src/css", "src/images"];
  const pkgVersion = grunt.file.read('./VERSION').trim();
  const getZipPath = (buildname) => `./zips/${buildname}-${browserName}-v${pkgVersion}.zip`;

  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-config');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-onesky-export');
  grunt.loadNpmTasks('grunt-onesky-import');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-purifycss');

  grunt.registerTask("build", "Builds the extension.", function() {
    switch(browserName) {
      case "opera":
        break;
      case "chrome":
        break;
      default:
        panic("The $browser variable was not set, set $browser and rerun this task.");
    }

    switch(process.env.build) { // eslint-disable-line no-process-env
      case "debug":
        var tasks = ["env:debug", "config:debug", "deletebuild", "createbuild", "babel", "replace", "bowercopy", "sass", "browserify", "copyfiles", "changelog", "removeartifacts"];
        grunt.task.run(tasks);
        break;
      case "webstore":
        var tasks = ["env:webstore", "config:webstore", "deletebuild", "createbuild", "babel", "replace", "bowercopy", "sass", "browserify", "uglify", "copyfiles",
                     "purifycss", "cssmin", "changelog", "htmlmin", "removeartifacts"];
        grunt.task.run(tasks);
        break;
      default:
        panic("The build name was not set, set $build and then rerun this task.");
        break;
    }
  });

  grunt.registerTask("default", "build");

  grunt.registerTask("release", ["setreleaseenv", "createzip", "webstorepublish"]);

  grunt.freezeApp = () => { return process.env.freezeApp !== "0"; }

  grunt.getCommit = () => {
    if(["yes", "1", "true"].includes(process.env.gitinfo)) {
      return String(system('git log | head -n 1 | sed "s/commit //"')).trim();
    }
  }

  grunt.getBranch = () => {
    if(["yes", "1", "true"].includes(process.env.gitinfo)) {
      return String(system("git branch | grep '^*' | sed 's/* //'")).trim();
    }
  }

  grunt.registerTask("setreleaseenv", "set release env vars", () => {
    const empty = (s) => !s || (s.trim && s.trim().length === 0);
    if(process.env.audience === "internal" && empty(process.env.gitinfo)) {
      process.env.gitinfo = "yes"
    }
  });

  grunt.registerTask("webstorepublish", "publish extension on webstore", function() {
    const {audience,build} = process.env,
          finished        = this.async(),
          webstoreKeys    = webstoreConfigs.keys,
          webstoreTargets = {public: "default", internal: "trustedTesters"},
          webstoreIDs     = webstoreConfigs.ids,
          webstoreURL     = `https://chrome.google.com/webstore/detail/private-internet-access/${webstoreIDs[audience]}`,
          availableAnnoucement = (audience, webstoreURL) => {
            if(audience === "internal")
              return `New extension *v${pkgVersion}* published for *testers*.\n` +
                     `URL: ${webstoreURL}\n` +
                     `It can take up to 15 minutes to become available on the store.`
            else
              return `New extension *v${pkgVersion}* published for *all PIA users*.\n` +
                     `URL: ${webstoreURL}\n` +
                     `It can take up to 15 minutes to become available on the store.`
          },
          pendingAnnoucement = (audience, webstoreURL) => {
            if(audience === "internal")
              return `New extension *v${pkgVersion}* published for *testers*\n` +
                     `URL: ${webstoreURL}\n` +
                     `It will be available on store after review, which can take up to 60 minutes.`
            else
              return `New extension *v${pkgVersion}* published for *all PIA users*.\n` +
                     `URL: ${webstoreURL}\n` +
                     `It will be available on store after review, which can take up to 60 minutes.`
          },
          confirmPublish  = (res) => {
            if(res.status.indexOf("ITEM_PENDING_REVIEW") >= 0) {
              const msg = pendingAnnoucement(webstoreURL);
              sendToSlack(msg).then(() => ok(msg)).then(finished);
            } else if(res.status.indexOf("OK") >= 0) {
              const msg = availableAnnoucement(audience, webstoreURL);
              sendToSlack(msg).then(() => ok(msg)).then(finished);
            } else {
              panic(res);
              finished();
            }
          },
          publishUpload = (res, token) => {
            if(res.uploadState !== 'SUCCESS') {
              panic(res.itemError.map((e) => e.error_detail).join(","));
            }
            info(`Uploaded "${getZipPath(build)}". Please wait.`);
            webstore.publish(webstoreTargets[audience], token).then(confirmPublish);
          },
          uploadPackage = (token) => {
            webstore.uploadExisting(fs.createReadStream(getZipPath(build)), token).then((res) => publishUpload(res, token));
          };

    grunt.task.requires("createzip");

    if(Object.keys(webstoreIDs).indexOf(audience) < 0) {
      panic("$audience must be set to 'public' or 'internal'");
    }

    info("Starting upload");
    const webstore = require('chrome-webstore-upload')(Object.assign({extensionId: webstoreIDs[audience]}, webstoreKeys));
    webstore.fetchToken().then(uploadPackage);
  });

  grunt.registerTask("changelog", "Convert CHANGELOG.md from markdown to HTML", function() {
    const marked    = require('marked'),
          changelog = grunt.file.read('./CHANGELOG.md');
    marked.setOptions({sanitize: false, smartypants: true, gfm: true});
    grunt.file.write(`${grunt.config.get('buildpath')}/html/CHANGELOG.html`, marked(changelog));
  });

  grunt.registerTask("createzip", "Builds the extension, and then creates a .zip file from the build directory.", function() {
    const buildname   = process.env.build,
          fullZipPath = getZipPath(buildname),
          zipFilename = path.basename(fullZipPath);

    if(!buildname) {
      panic("The build name was not set, set $build and then rerun this task.");
    }

    if(!browserName) {
      panic("The $browser variable was not set, set $browser and then rerun this task.");
    }

    info("Building extension");
    system("mkdir -p zips");
    system(`build=${buildname} gitinfo=${process.env.gitinfo} grunt`);
    info("Building zip archive");
    system(`cd builds/ && zip -r ${zipFilename} ${buildname}`);
    system(`mv builds/${zipFilename} zips/`);
    ok(`Created ${fullZipPath}`);
  });

  grunt.registerTask("deletebuild", "Delete a build directory.", function() {
    return system("rm -rf " + grunt.config.get("buildpath"));
  });

  grunt.registerTask("createbuild", "Create a build directory.", function() {
    return system("mkdir -p " + grunt.config.get("buildpath"));
  });

  grunt.registerTask("copyfiles", "Copy static assets to a build directory.", function() {
    switch(process.env.browser) {
      case "opera":
        system(`cp ${grunt.config.get('buildpath')}/manifest.opera.json ${grunt.config.get('buildpath')}/manifest.json`);
        break;
      default:
        system(`rm ${grunt.config.get('buildpath')}/manifest.opera.json`);
        break;
    }
    return system("cp -R src/{_locales,images,html,css,fonts} " + grunt.config.get("buildpath"));
  });

  grunt.registerTask("removeartifacts", "Remove artifacts created during the build process.", function() {
    return system("rm -rf src/scss/vendored/ src/js/{templates,component}/ tmp/");
  });
}
