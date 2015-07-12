var grjs     = require('../');
var should   = require('should');
var fs       = require('fs');
var path     = require('path');
var astEqual = require('esprima-ast-equality');
var gutil    = require('gulp-util');

require('mocha');

function getFile(base, filePath) {
    return new gutil.File({
        path:     filePath,
        cwd:      __dirname,
        base:     base,
        contents: fs.readFileSync(filePath)
    });
}

function getFixture(filePath) {
    return getFile(path.join('test', 'fixtures'), path.join('test', 'fixtures', filePath));
}

function getBufferContent(buffer) {
    return Buffer.isBuffer(buffer) ? buffer.toString('utf8') : buffer;
}

describe('gulp-requirejs', function () {

    describe('simple AMD file', function () {

        it('should concat the files in the correct order', function (done) {
            var stream = grjs({
                out: 'simple_init.js',

                baseUrl: 'test/fixtures/',

                findNestedDependencies: true,
                skipPragmas:            true,

                name: 'simple_init',

                include: ['simple_init'],

                create:   true,
                optimize: 'none'
            });

            stream.on('data', function (output) {
                should.exist(output);
                should.exist(output.path);
                should.exist(output.relative);
                should.exist(output.contents);

                output.relative.should.equal('simple_init.js');
                astEqual(getBufferContent(output.contents), fs.readFileSync('test/expected/simple_init.js', 'utf8'));
                done();
            });

            stream.write(getFixture('simple_init.js'));
            stream.write(getFixture(path.join('vendor', 'simple_amd_file.js')));
            stream.end();
        });

    });

    describe('AMD und UMD mix', function () {

        it('should concat the files in the correct order', function (done) {
            var stream = grjs({
                out: 'umd_init.js',

                baseUrl: 'test/fixtures/',

                findNestedDependencies: true,
                skipPragmas:            true,

                name: 'umd_init',

                include: ['umd_init'],

                create:   true,
                optimize: 'none'
            });

            stream.on('data', function (output) {
                should.exist(output);
                should.exist(output.path);
                should.exist(output.relative);
                should.exist(output.contents);

                output.relative.should.equal('umd_init.js');
                astEqual(getBufferContent(output.contents), fs.readFileSync('test/expected/umd_init.js', 'utf8'));
                done();
            });

            stream.write(getFixture('umd_init.js'));
            stream.write(getFixture(path.join('vendor', 'simple_amd_file.js')));
            stream.write(getFixture(path.join('vendor', 'umd_file.js')));
            stream.end();
        });

    });

    describe('amd file with shim', function () {
        it('should concat the files in the correct order, and build wrappers for the shimmed files', function (done) {
            var stream = grjs({
                out:                    'complex_init.js',
                baseUrl:                'test/fixtures/vendor/',
                findNestedDependencies: true,
                skipPragmas:            true,
                name:                   '../complex_init',
                create:                 true,
                optimize:               'none',
                shim:                   {
                    'non_md_file': {
                        exports: 'myLib'
                    }
                }
            });

            stream.on('data', function (output) {
                should.exist(output);
                should.exist(output.path);
                should.exist(output.relative);
                should.exist(output.contents);

                output.relative.should.equal('complex_init.js');
                astEqual(getBufferContent(output.contents), fs.readFileSync('test/expected/complex_init.js', 'utf8'));
                done();
            });

            var base = path.join('test', 'fixtures', 'vendor');
            stream.write(
                getFile(base, path.join('test', 'fixtures', 'complex_init.js'))
            );
            stream.write(
                getFile(base, path.join(base, 'simple_amd_file.js'))
            );
            stream.write(
                getFile(base, path.join(base, 'umd_file.js'))
            );
            stream.write(
                getFile(base, path.join(base, 'complex_amd_file.js'))
            );
            stream.write(
                getFile(base, path.join(base, 'non_md_file.js'))
            );
            stream.end();

        });
    });


    //@TODO test fo error throwing!

    describe('ERRORS: ', function () {

        it('should throw an error if we forget to pass in an options object', function (done) {

            (function () {
                grjs();
            }).should.throwError(/^Miss.*/);

            done();
        });

        it('should throw an error if we forget to set the baseUrl', function (done) {

            (function () {
                grjs({
                    out: 'test.js'
                });
            }).should.throwError(/^Pip.*/);

            done();
        });


        it('should throw an error if we forget to set the output', function (done) {

            (function () {
                grjs({
                    baseUrl: 'test/dir'
                });
            }).should.throwError(/^Only.*/);

            done();
        });

        it('should emit an error event when the require.js optimizer finds an error', function (done) {

            var stream = grjs({
                paths:    {
                    'text': './errtest'
                },
                logLevel: 0,
                wrapShim:                true,
                useStrict:               true,
                baseUrl:  'test/dir',
                name:     'testDir/init',
                out:      'testURL',
                preserveLicenseComments: false,
                generateSourceMaps:      false,
                optimize:                "none"
            });

            stream.on('error', function (err) {
                done();
            });

            stream.end();
        });

    });

});
