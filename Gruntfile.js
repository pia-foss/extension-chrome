// third party requirements
require('dotenv').config();
const config = require('./config');

module.exports = function launch(grunt) {
  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-config');
  grunt.loadNpmTasks('grunt-onesky-export');
  grunt.loadNpmTasks('grunt-onesky-import');
};
