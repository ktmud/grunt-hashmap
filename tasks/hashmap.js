/*
 * grunt-hashmap
 * https://github.com/ktmud/grunt-hashmap
 *
 * Copyright (c) 2013 ktmud
 * Licensed under the MIT license.
 */
'use strict';

var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var defaultOutput = '#{= dest}/hash.json';
var defaultEtag = '#{= size}-#{= +mtime}';
var defaultRename = '#{= dirname}/#{= basename}_#{= hash}#{= extname}';

module.exports.defaultEtag = defaultEtag;

module.exports = function(grunt) {

  grunt.registerMultiTask('hashmap', 'Create version mapping for your static files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      output: defaultOutput,
      merge: false,
      encoding: null, // encoding of file contents
      etag: null,
      algorithm: 'md5', // the algorithm to create the hash
      rename: defaultRename, // save the original file as what
      keep: true, // should we keep the original file or not
      hashlen: 10, // length for hashsum digest
      salt: null   // salt to add to the file contents before hashing
    });

    grunt.template.addDelimiters('#{ }', '#{', '}');

    var tmpl_option = {
      delimiters: '#{ }',
    };

    var encoding = options.encoding;
    var rename_format = (typeof options.rename === 'string') ? options.rename : defaultRename;

    var done = this.async();

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var cwd = f.cwd;
      var dest = f.dest;

      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        filepath = realpath(filepath);
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else if (grunt.file.isFile(filepath)) {
          return true;
        }
      });
      var mapping = {};

      if (!src.length) {
        grunt.log.writeln('No source file..');
        done();
        return;
      }

      if (dest && grunt.file.isFile(dest)) {
        grunt.log.warn('Destination must be a directory.');
      }

      src.forEach(function(filepath) {
        var r = realpath(filepath), d;

        if (options.etag) {
          fs.stat(r, function(err, stats) {
            if (err) {
              grunt.log.error('Stats for "' + filepath + '" failed.');
            }
            var etag = (typeof options.etag === 'string') ? options.etag : defaultEtag;
            tmpl_option['data'] = stats;
            d = grunt.template.process(etag, tmpl_option);
            stash(filepath, d);
          });
        } else {
          var s = fs.ReadStream(r);
          //var contents = grunt.file.read(r, { encoding: null });
          var shasum = crypto.createHash(options.algorithm);
          s.on('data', function(data) {
            if (encoding) {
              data = data.toString(encoding);
            }
            shasum.update(data);
          });
          s.on('end', function() {
            if (options.salt) {
              shasum.update(options.salt);
            }
            d = shasum.digest('hex').slice(0, options.hashlen);
            stash(filepath, d);
          });
        }
      });

      function stash(filepath, d) {
        mapping[filepath] = d;

        grunt.verbose.writeln(
          (options.etag ? 'Etag' : 'Hash') + ' for ' + filepath + ': ' + d);

        if (dest) {
          save(filepath);
        }

        if (Object.keys(mapping).length === src.length) {
          output();
        }
      }

      function realpath(filepath) {
        return cwd ? path.join(cwd, filepath) : filepath;
      }
      function renamed(filepath) {
        if (rename_format) {
          var hash = mapping[filepath];
          var extname = path.extname(filepath);
          tmpl_option['data'] = {
            dest: dest,
            cwd: cwd,
            hash: hash,
            extname: extname,
            dirname: path.dirname(filepath),
            basename: path.basename(filepath, extname),
          };
          filepath = grunt.template.process(rename_format, tmpl_option);
        }
        return filepath;
      }

      function save(filepath) {
        var srcfile = realpath(filepath);
        var destfile = path.join(dest, renamed(filepath));
        if (srcfile !== destfile) {
          if (destfile.indexOf(dest) === -1) {
            grunt.log.warn('Renamed target "' + destfile + '" is not in dest directory.');
          }
          grunt.file.copy(srcfile, destfile);
          grunt.log.oklns('"' + srcfile + '" => "' + destfile + '"');
          if (!options.keep) {
            grunt.verbose.writeln('Deleting source "' + srcfile + '"..');
            grunt.file.delete(srcfile);
          }
        }
      }

      function output() {
        grunt.log.oklns('All hashed.');
        if (options.output) {
          tmpl_option['data'] = { cwd: cwd || '', dest: dest };

          var jsonfile = typeof options.output === 'string' ? options.output : defaultOutput;
          jsonfile = grunt.template.process(jsonfile, tmpl_option);
          if (options.merge && grunt.file.exists(jsonfile)) {
            var old = grunt.file.readJSON(jsonfile);
            if (typeof old === 'object') {
              for (var k in old) {
                if (!(k in mapping)) {
                  mapping[k] = old[k];
                }
              }
            }
          }
          mapping = sortObject(mapping);
          grunt.file.write(jsonfile, JSON.stringify(mapping, null, 2));
          grunt.log.oklns('Hashmap "' + jsonfile + '" saved.');
        }
        done();
      }

      function sortObject(obj) {
        var arr = [],
            sortedObject = {};

        for (var o in obj) {
          if (obj.hasOwnProperty(o)) {
            arr.push(o);
          }
        }

        arr.sort();

        for (var i = 0, l = arr.length; i < l; i++) {
          sortedObject[arr[i]] = obj[arr[i]];
        }

        return sortedObject;
      }
    });
  });

};
