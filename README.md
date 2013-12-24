# grunt-hashmap [![Build Status](https://api.travis-ci.org/ktmud/grunt-hashmap.png?branch=master)](https://travis-ci.org/ktmud/grunt-hashmap)

> Generate a hash mapping for your assets files, in order to burst cache

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-hashmap --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-hashmap');
```

## The "hashmap" task

### Overview
In your project's Gruntfile, add a section named `hashmap` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  hashmap: {
    options: {
      // These are default options
      output: '#{= dest}/hash.json',
      etag: null, // See below([#](#option-etag))
      algorithm: 'md5', // the algorithm to create the hash
      rename: '#{= dirname}/#{= basename}_#{= hash}#{= extname}', // save the original file as what
      keep: true, // should we keep the original file or not
      merge: false, // merge hash results into existing `hash.json` file or override it.
      hashlen: 10, // length for hashsum digest
    },
    your_target: {
      // Target-specific file lists and/or options go here.
      options: {
        output: 'static/versions.json',
      },
      files: {
        cwd: 'static/dist',
        src: ['js/**/*.js', 'css/**/*.css'],
        dest: 'static/dist'
      },
    },
  },
})
```

In your express application, add a **static_url** generator to template helpers:

``` javascript
var path = require('path');
var hash_cache = require('./static/hash.json');

var reg_css_js = /\.(css|js)$/;

// change these consts according to the app's running environment
var STATIC_ROOT = 'http://img.example.com';
var DEBUG = false;

function static_url(p) {
  if (p[0] == '/') p = p.slice(1);
  if (DEBUG || !reg_css_js.test(p)) return STATIC_ROOT + '/' + p;

  var hash = hash_cache[p];
  if (hash) {
    var ext = path.extname(p);
    p = path.join(path.dirname(p), path.basename(p, ext) + '_' + hash + ext); 
  }
  return STATIC_ROOT + '/' + p;
}


app.locals({
  static: static_url
});
```

In your template, always refer to static file url like this:

``` jade
script(src="#{static('/css/abc.css')}")
```

The output would be:

```
<script type="text/javascript" src="http://img.example.com/css/abc_83hfa2gi.css"></script>

<!-- or when in debug mode: -->
<script type="text/javascript" src="/css/abc.css"></script>
```


### Options

#### options.output
Type: `String`
Default value: `'#{= dest}/hash.json'`

Where to save the hash mapping json file.
Available variables are `dest`, `cwd`.
You can always use `#{= grunt.config.get(...) }'` to access config data in your `Gruntfile`.

Set to `null` will disable the output.

The output format:

```js
{
  "a/b.js": "aaa93n3f2",
  "foo.css": "maaof33mao"
}
```

#### options.etag <a id="option-etag"></a>
Type: `String`
Default value: `null`

In spite of standard digest algorithms provided by the
[crypto]('http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm') module,
you can set a "etag" format to use as file version.

Set `etag` to `true` will use the default format: `#{= size}-#{= +mtime}`.

All values in a [fs.Stats](http://nodejs.org/api/fs.html#fs_class_fs_stats) result are available.

#### options.algorithm
Type: `String`
Default value: `'md5'`

The algorithm to generate hash digests. Depend on the version of OpenSSL on the platform.
Examples are `'sha1'`, `'md5'`, `'sha256'`, etc.

#### options.hashlen
Type: `Number`
Default value: `10`

The length of a hash digest hex value.

#### options.rename
Type: `String`
Default value: `'#{= dirname}/#{= basename}\_#{= hash}#{= extname}'`

Rename files, to include a hash in it. This is often for safely bursting cache.
Available variables are:

  - **hash**      - The hash/etag value.
  - **dest**      - The destination directory.
  - **cwd**       - The `cwd` you setted for `files` prop section.
  - **filepath**  - The path of the file.
  - **basename**  - The basename of the file, with extension name excluded.
  - **dirname**   - The directory name of the file.
  - **extname**   - The extension name of the file.

Examples:

    "abc/defg/hijk.js" =>
    {
      filepath: "abc/defg/hijk.js",
      basename: "hijk",
      dirname: "abc/defg",
      extname: "js"
    }

With the default rename format, the result will be something like `"abc/defg/hijk\_e8e7f9e4.js"`.

Will raise a warning if the renamed target is not in dest directory.
  
#### options.keep
Type: `String`
Default value: `true`

Whether to keep the original files after rename it.

#### options.merge
Type: `String`
Default value: `false`

This option is mainly for cases like this:

```js
grunt.initConfig({
  hashmap: {
    options: {
      output: 'static/hash.json',
      merge: true,
    },
    js: {
      cwd: 'static/dist',
      src: 'js/**/*.js',
      dest: 'static/dist'
    },
    css: {
      cwd: 'static/dist',
      src: 'css/**/*.css',
      dest: 'static/dist'
    },
  },
  watch: {
    js: {
      files: ['static/js/**/*.js'],
      tasks: ['hashmap:js']
    }, 
    css: {
      files: ['static/css/**/*.css'],
      tasks: ['hashmap:css']
    }
  },
})
```

Hashmap tasks for css and js are created seperately.
So with the `grunt-contrib-watch` running, when you modify one single file,
grunt won't need to run the whole hash mapping process for all files.

Since all the hash results will be written to the same file, and the hashmaps
are automatically merged. It is safe to refer to `hash.json` for all static files
in your application's static url generator.

The downside of this practice is that hashes for deleted files will never be removed,
unless `hash.json` is removed. But of course, you can always set up a `grunt clean` task. 

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* 0.1.5 -  add option.salt to burst all the cache, thanks @theoephraim 
* 0.1.4 -  format output json, and sort it by filenames (diff a hashmap made easy). Thanks @dpolivy !
* 0.1.1 -  add options.encoding for file contents reading
* 0.1.0 -  first release
