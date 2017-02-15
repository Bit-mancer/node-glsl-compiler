'use strict';

/* eslint-disable no-console */

// core dependencies
// (dev dependencies are required locally in order to reduce the install load for the majority of users)
var path = require( 'path' );
var fs = require( 'fs' );
var gulp = require( 'gulp' );
var shell = require( 'gulp-shell' );


var GLSLANG_REPO = 'https://github.com/KhronosGroup/glslang.git';
var GLSLANG_TAG = 'Overload400-PrecQual'; // (this is the current release)
var GTEST_REPO = 'https://github.com/google/googletest.git';
var GTEST_TAG = 'release-1.8.0';

var GLSLANG_DIR = 'glslang'; // local repo
var BUILD_DIR = 'build'; // node-cmake builds to this path

var paths = {
    js: [ '*.js', './src/**/*.js' ],
    glslang: path.join( __dirname, GLSLANG_DIR ),
    gtest: path.join( __dirname, GLSLANG_DIR, 'External', 'googletest' ),
    build: BUILD_DIR,
    nativeValidator: path.join( __dirname, BUILD_DIR, 'glslang', 'StandAlone', 'glslangValidator' ),
    nativeTests: path.join( __dirname, BUILD_DIR, 'glslang', 'gtests', 'glslangtests' )
};


/**
 * Clones the specified repo at the specified tag; the resulting repo will be in a detached head state.
 *
 * @param {string} repo Git repo to clone.
 * @param {string} tag Git tag to checkout.
 * @param {string} path The path to clone the repo to.
 * @return {Promise} .
 */
function gitCloneTagAsync( repo, tag, path )  {

    // dev dependencies:
    var assert = require( 'assert-plus' );
    var Q = require( 'q' );
    var git = require( 'gulp-git' );
    var chalk = require( 'chalk' );

    assert.string( repo );
    assert.string( tag );
    assert.string( path );

    var deferred = Q.defer();

    try {

        if ( fs.existsSync( path ) ) {
            console.log( chalk.bold( 'The path ' + path + ' exists; skipping git clone for repo ' + repo ) );
            deferred.resolve();
            return deferred.promise;
        }

        var args = '--branch ' + tag + ' --depth 1 "' + path + '"';
        console.log( chalk.bold( '=> git clone ' + repo + ' ' + args ) );

        git.clone( repo, { args: args }, function(err) {
            try {
                if ( err ) {
                    deferred.reject( new Error( '"git clone ' + repo + ' ' + args + '" failed with error: ' + err.message + '\n' + err.stack ) );
                    return;
                } else {
                    deferred.resolve();
                    return;
                }
            } catch ( err ) {
                deferred.reject( new Error( 'Unhandled exception in gitCloneTagAsync (git.clone callback): ' + err.message + '\n' + err.stack ) );
                return;
            }
        } );

        return deferred.promise;

    } catch ( err ) {
        deferred.reject( new Error( 'Unhandled exception in gitCloneTagAsync: ' + err.message + '\n' + err.stack ) );
        return deferred.promise;
    }
}




gulp.task( 'js-lint', function() {

    // dev dependency:
    var eslint = require( 'gulp-eslint' );

    return gulp.src( paths.js )
        .pipe( eslint() )
        .pipe( eslint.format() )
        .pipe( eslint.failAfterError() );
});

gulp.task( 'lint', ['js-lint'] );

gulp.task( 'lint-watch', function() {
    return gulp.watch( paths.js, ['js-lint'] );
});


gulp.task( 'test', [ 'verify-native-test-binaries-exist' ], shell.task( [
    paths.nativeTests
]));


/**
 * Used during development to update the version of the native dependencies
 */
gulp.task( 'clone', function() {

    // dev dependency:
    var chalk = require( 'chalk' );

    return gitCloneTagAsync( GLSLANG_REPO, GLSLANG_TAG, paths.glslang )
    .then( function() {
        gitCloneTagAsync( GTEST_REPO, GTEST_TAG, paths.gtest );
    }).catch( function(err) {
        console.error( chalk.red( err.message ) );
        throw err;
    }).done();
});



gulp.task( 'verify-native-sources-exist', function() {

    if ( ! fs.existsSync( paths.glslang ) ) {
        // "gulp clone" should have been run...
        throw new Error( 'glslang does not exist! (this indicates a problem in the package development environment)' );
    }
});

gulp.task( 'verify-native-configure', ['verify-native-sources-exist'], function() {

    if ( ! fs.existsSync( paths.build ) ) {
        throw new Error( 'The build directory does not exist! (has "gulp configure" been run?)' );
    }
});

gulp.task( 'verify-native-binaries-exist', ['verify-native-configure'], function() {

    if ( ! fs.existsSync( paths.nativeValidator ) ) {
        throw new Error( 'The glslangValidator binary does not exist!' );
    }
});

gulp.task( 'verify-native-test-binaries-exist', ['verify-native-configure'], function() {

    if ( ! fs.existsSync( paths.nativeTests ) ) {
        throw new Error( 'The glslangtests binary does not exist! (by default, node-glslang does not include the glslang native tests in order to reduce the package size; to run these tests, first run "npm run task clone", then "npm run task configure", then "npm run task build", then re-run the tests)' );
    }
});

gulp.task( 'configure', ['verify-native-sources-exist'], shell.task( [
    'ncmake configure'
]));

gulp.task( 'build', ['verify-native-configure'], shell.task( [
    'ncmake build'
]));

gulp.task( 'rebuild', ['verify-native-configure'], shell.task( [
    'ncmake rebuild'
]));

gulp.task( 'clean', ['verify-native-sources-exist'], shell.task( [
    'ncmake clean'
]));


// Preflight check -- run before filing a PR, etc.
gulp.task( 'preflight', function(cb) {
    // TODO run-sequence is obviated in gulp 4 via gulp.series
    require( 'run-sequence' )( 'lint', 'configure', 'build', 'test', cb );
});

// Continuous integration (this is what travis runs)
gulp.task( 'ci', function(cb) {
    // TODO run-sequence is obviated in gulp 4 via gulp.series
    require( 'run-sequence' )( 'clone', 'preflight', cb );
});
