var path        = require('path');
var slash       = require('slash');
var gutil       = require('gulp-util'),
    requirejs   = require('requirejs'),
    PluginError = gutil.PluginError,
    File        = gutil.File,
    through     = require('through2');

// Consts
const PLUGIN_NAME = 'gulp-rjs-optimize';

module.exports = function (opts) {

    'use strict';

    if (!opts) {
        throw new PluginError(PLUGIN_NAME, 'Missing options array!');
    }

    if (!opts.out && typeof opts.out !== 'string') {
        throw new PluginError(PLUGIN_NAME, 'Only single file outputs are supported right now, please pass a valid output file name!');
    }

    if (!opts.baseUrl) {
        throw new PluginError(PLUGIN_NAME, 'Pipeing dirs/files is not supported right now, please specify the base path for your script.');
    }

    var includes = [];

    function collectIncludes(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            cb();
            return;
        }
        var rel      = path.relative(file.base, file.path);
        var ext      = path.extname(file.path);
        var basename = path.basename(rel, path.extname(file.path));
        var dirname  = path.dirname(rel);
        var item     = slash(path.join(dirname, basename));
        if (ext === '.html' || ext === '.json') {
            item = 'text!' + item + ext;
            includes.unshift(item);
        } else {
            includes.push(item);
        }
        cb();
    }

    function endStream(cb) {
        var that     = this,
            _fName   = opts.out;
        opts.include = includes;
        // just a small wrapper around the r.js optimizer, we write a new gutil.File (vinyl) to the Stream, mocking a file, which can be handled
        // regular gulp plugins (i hope...).
        optimize(opts, function (text, sourceMapText) {
            var bundle = new File({
                path:     _fName,
                contents: new Buffer(text)
            });
            that.push(bundle);

            if (sourceMapText) {
                var bundleMap = new File({
                    path:     _fName + '.map',
                    contents: new Buffer(sourceMapText)
                });
                that.push(bundleMap);
            }

            cb();
        });

    }

    return through.obj(collectIncludes, endStream);
};

// a small wrapper around the r.js optimizer
function optimize(opts, cb) {
    opts.out = cb;
    requirejs.optimize(opts);
}