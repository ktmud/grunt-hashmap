'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.hashmap = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default: function(test) {
    test.expect(6);

    var result = grunt.file.readJSON('tmp/default/hash.json');

    //var expected = grunt.file.readJSON('test/expected/hash.json');
    test.ok('blank.gif' in result, 'Image file hashed.');
    test.ok('a.js' in result, 'Text file hashed.');
    test.ok(result['a.js'].length === 10, 'Hash digest have a length of 10.');
    test.ok(result['a.js'] === result['mod/a.js'], 'Same contents, same hash.');
    test.ok(result['a.js'] !== result['a.css'], 'Different contents, different hash.');

    var original = grunt.file.read('test/assets/mod/b.js');
    var moved = grunt.file.read('tmp/default/mod/b_' + result['mod/b.js'] + '.js');
    test.equal(original, moved, 'File renamed.');

    test.done();
  },
  salt: function(test) {
    test.expect(1);

    var result1 = grunt.file.readJSON('tmp/default/hash.json');
    var result2 = grunt.file.readJSON('tmp/salt/hash.json');

    test.ok(result1['a.js'] !== result2['a.js'], 'Added salt changes hash.');

    test.done();
  },
  etag: function(test) {
    test.expect(1);

    var result = grunt.file.readJSON('tmp/etag/hashmap.json');

    var fs = require('fs');
    function getEtag(filepath) {
      var stats = fs.statSync(process.cwd() + '/' + filepath);
      return stats.size + '-' + (+stats.mtime);
    }

    test.ok(result['blank.gif'] === getEtag('test/assets/blank.gif'), 'Etag matched.');

    test.done();
  },
  renamed: function(test) {
    test.expect(1);

    var result = grunt.file.readJSON('tmp/renamed/hash.json');
    var original = grunt.file.read('test/assets/mod/b.js');
    var moved = grunt.file.read('tmp/renamed/'+ result['mod/b.js'] + '/b.js');

    test.equal(original, moved, 'File renamed.');

    test.done();
  },
  merged: function(test) {
    test.expect(1);

    var result = grunt.file.readJSON('tmp/etag/hashmap.json');

    test.ok('blank.gif' in result && 'a.js' in result, 'Mapping merged.');

    test.done();
  },
  sorted: function(test) {
    test.expect(6);

    var result = grunt.file.readJSON('tmp/sorted/hashmap.json');

    var lastItem;
    for (var item in result) {
      if (lastItem === undefined) {
        lastItem = item;
      }

      // Make sure the current item comes after the previous item in the sort order
      test.ok(item >= lastItem, 'Items not in sorted order.');

      lastItem = item;
    }

    test.done();
  }
};
