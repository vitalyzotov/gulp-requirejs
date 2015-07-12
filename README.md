#gulp-requirejs-bundle

[![Dependency Status](https://david-dm.org/vitalyzotov/gulp-requirejs.svg)](https://david-dm.org/vitalyzotov/gulp-requirejs)
[![Build Status](https://travis-ci.org/vitalyzotov/gulp-requirejs.svg?branch=master)](https://travis-ci.org/vitalyzotov/gulp-requirejs)

## Information

A small, simply, very easy wrapper around the [require.js optimizer](https://github.com/jrburke/r.js) to work with [gulp.js](https://github.com/gulpjs/gulp) with bundling support.

<table>
<tr> 
<td>Package</td><td>gulp-requirejs-bundle</td>
</tr>
<tr>
<td>Description</td>
<td>uses require.js's r.js optimizer to combine require.js AMD modules into one file</td>
</tr>
<tr>
<td>Node Version</td>
<td>0.10</td>
</tr>
</table>


##Installation

Simply add `gulp-requirejs-bundle` as a dev-dependency in your package.json or run

```bash
$ npm install --save-dev gulp-requirejs-bundle
```

## Usage


```javascript
var gulp = require('gulp'),
    rjs = require('gulp-requirejs-bundle');

gulp.task('requirejsBuild', function() {

    return gulp.src([
        config.buildDir + '/**/*.js',
        config.buildDir + '/**/*.html', config.buildDir + '/**/*.json'
    ])
        .pipe(rjs({
            paths:                   {
                'jquery':               'empty:',
                'text':                 '../vendor/requirejs-text/text',
                'domReady':             '../vendor/requirejs-domready/domReady'
            },
            wrapShim:                true,
            useStrict:               true,
            baseUrl:                 config.buildDir,
            name:                    config.finalName + '/main',
            out:                     config.finalName + '.js',
            preserveLicenseComments: false,
            generateSourceMaps:      false,
            //stubModules:             ['text'],
            optimize:                "none"
        }))
        .pipe(gulp.dest(config.targetDir + '/js'));
});
```

### Error handling

gulp-requirejs-bundle will emit errors when you don't pass an options object and if the `baseUrl` or `out` properties are undefined. 
  
gulp-requirejs-bundle will also emit errors from the require.js optimizer.  


## Options

The options object supports the same parameters as the [require.js optimizer](https://github.com/jrburke/r.js).

