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
      salt: {
        options: {
          salt: 'cachebuster5000'
        },
        cwd: 'test/assets',
        src: '**',
        dest: 'tmp/salt'
      },
      etag: {
        options: {
          etag: true,
          output: '#{=dest}/hashmap.json'
        },
        cwd: 'test/assets',
        src: 'blank.gif',
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
      merged: {
        options: {
          merge: true,
          etag: true,
          output: 'tmp/etag/hashmap.json'
        },
        cwd: 'test/assets',
        src: 'a.js',
        dest: 'tmp/merged'
      },
      sorted: {
        options: {
          output: 'tmp/sorted/hashmap.json'
        },
        cwd: 'test/assets',
        // Include these in a non-sorted order, so we can verify the output is sorted
        src: ['blank.gif', 'mod/*', 'a.js', 'hash.json', 'a.css'],
        dest: 'tmp/sorted'
      }
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
