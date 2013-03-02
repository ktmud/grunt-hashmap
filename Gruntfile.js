/*
 * grunt-hashmap
 * https://github.com/ktmud/grunt-hashmap
 *
 * Copyright (c) 2013 ktmud
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    hashmap: {
      default_options: {
        cwd: 'test/assets',
        src: '**',
        dest: 'tmp/default'
      },
      etag: {
        options: {
          etag: true,
          output: '#{=dest}/hashmap.json'
        },
        cwd: 'test/assets',
        src: '**',
        dest: 'tmp/etag'
      },
      renamed: {
        options: {
          rename: '#{=hash}/#{=basename}#{=extname}', // use rename to flatten
        },
        cwd: 'test/assets',
        src: 'mod/**',
        dest: 'tmp/renamed'
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'hashmap', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
