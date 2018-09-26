module.exports = {
  pkg: require("../package.json"),
  babel: require("./babel.json"),
  browserify: require("./browserify.json"),
  sass: require("./sass.json"),
  uglify: require("./uglify.json"),
  cssmin: require("./cssmin.json"),
  htmlmin: require("./htmlmin.json"),
  eslint: require("./eslint.json"),
  oneskyExport: require("./oneskyexport"),
  oneskyImport: require("./oneskyimport"),
  env: require("./env.json"),
  config: require("./buildconfig.json"),
  replace: require("./replacements.json"),
  purifycss: require("./purifycss.json"),
  slack: require('./slack'),
  compress: require('./compress.json')
}
