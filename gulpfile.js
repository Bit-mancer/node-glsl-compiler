'use strict';

/* eslint-disable no-console */

// core dependencies
// (dev dependencies are required locally in order to reduce the install load for the majority of users)

// Core node modules
const path = require( 'path' );
const fs = require( 'fs' );

// Public NPM modules
const assert = require( 'assert-plus' );
const gulp = require( 'gulp' );
const shell = require( 'gulp-shell' );
const Promise = require( 'bluebird' );
const jsdoc = require( 'gulp-jsdoc3' );
const del = require( 'del' );

// Local modules



const GLSLANG_REPO = 'https://github.com/KhronosGroup/glslang.git';
const GLSLANG_TAG = 'Overload400-PrecQual'; // (this is the current release)
const GTEST_REPO = 'https://github.com/google/googletest.git';
const GTEST_TAG = 'release-1.8.0';

const GLSLANG_DIR = 'glslang'; // local repo
const BUILD_DIR = 'build'; // node-cmake builds to this path

const paths = {
    // gulp will handle path separator differences for the following:
    readme: [ 'README.md' ],
    config: [ '.eslintrc.js', 'gulpfile.js' ],
    js: [ 'index.js', './lib/**/*.js' ],
    jsDev: [ './example/**/*.js' ], // excluded from documentation
    cpp: [ '*.cpp', './src/**/*.cpp' ],
    cmake: [ 'NodeJS.cmake', 'CMakeLists.txt' ],

    // handle path separator differences ourselves for the following:
    glslang: path.join( __dirname, GLSLANG_DIR ),
    gtest: path.join( __dirname, GLSLANG_DIR, 'External', 'googletest' ),
    build: path.join( __dirname, BUILD_DIR ),
    nativeValidator: path.join( __dirname, BUILD_DIR, 'glslang', 'StandAlone', 'glslangValidator' ),
    nativeTests: path.join( __dirname, BUILD_DIR, 'glslang', 'gtests', 'glslangtests' ),
    docOutput: path.join( __dirname, 'doc' ) // must match value in jsdoc-config.json
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
    const chalk = require( 'chalk' );
    const git = Promise.promisifyAll( require( 'gulp-git' ) );

    assert.string( repo );
    assert.string( tag );
    assert.string( path );

    return new Promise( (resolve, reject) => {

        if ( fs.existsSync( path ) ) {
            console.log( chalk.bold( `The path ${path} exists; skipping git clone for repo ${repo}` ) );
            return resolve();
        }

        const args = `--branch ${tag} --depth 1 "${path}"`;
        console.log( chalk.bold( `=> git clone ${repo} ${args}` ) );

        git.cloneAsync( repo, { args: args } )
        .then( () => {
            resolve();
        })
        .catch( err => {
            reject( new Error( `"git clone ${repo} ${args}" failed with error: ${err.message}\n${err.stack}` ) );
        });
    });
}




gulp.task( 'js-lint', () => {

    // dev dependency:
    const eslint = require( 'gulp-eslint' );

    return gulp.src( paths.js.concat( paths.jsDev.concat( paths.config ) ) )
        .pipe( eslint() )
        .pipe( eslint.format() )
        .pipe( eslint.failAfterError() );
});

gulp.task( 'lint', ['js-lint'] );

gulp.task( 'lint-watch', () => {
    gulp.watch( paths.js.concat( paths.jsDev.concat( paths.config ) ), ['js-lint'] );
    gulp.watch( paths.cmake.concat( paths.cpp ), ['build'] ); // eh not exactly linting, but good enough for this small project
});


gulp.task( 'test', [ 'verify-native-test-binaries-exist' ], shell.task( [
    paths.nativeTests
]));


gulp.task( 'clean-doc', () => {
    return del( [ paths.docOutput ] );
});

gulp.task( 'doc', ['clean-doc'], (cb) => {
    // dev dependencies:
    const chalk = require( 'chalk' );
    const git = Promise.promisifyAll( require( 'gulp-git' ) );

    git.statusAsync( { args:'--porcelain', quiet: true } )
    .then( stdout => {
        if ( stdout !== '' ) {
            console.warn( chalk.yellow( '\n !!! Documentation is being generated on a git working tree that is not in a clean state !!!\n' ) );
        }

        const jsdocConfig = require( './jsdoc-config.json' );
        gulp.src( paths.readme.concat( paths.js ), {read: false} )
            .pipe( jsdoc( jsdocConfig, cb ) );
    });
});


/**
 * Used during development to update the version of the native dependencies
 */
gulp.task( 'clone', () => {

    return gitCloneTagAsync( GLSLANG_REPO, GLSLANG_TAG, paths.glslang )
    .then( () => {
        return gitCloneTagAsync( GTEST_REPO, GTEST_TAG, paths.gtest );
    });
});



gulp.task( 'verify-native-sources-exist', () => {

    if ( ! fs.existsSync( paths.glslang ) ) {
        // "gulp clone" should have been run...
        throw new Error( 'glslang does not exist! (this indicates a problem in the package development environment)' );
    }
});

gulp.task( 'verify-native-configure', ['verify-native-sources-exist'], () => {

    if ( ! fs.existsSync( paths.build ) ) {
        throw new Error( 'The build directory does not exist! (has "gulp configure" been run?)' );
    }
});

gulp.task( 'verify-native-binaries-exist', ['verify-native-configure'], () => {

    if ( ! fs.existsSync( paths.nativeValidator ) ) {
        throw new Error( 'The glslangValidator binary does not exist!' );
    }
});

gulp.task( 'verify-native-test-binaries-exist', ['verify-native-configure'], () => {

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
gulp.task( 'preflight', (cb) => {
    // TODO run-sequence is obviated in gulp 4 via gulp.series
    require( 'run-sequence' )( 'lint', 'doc', 'configure', 'build', 'test', cb );
});

// Continuous integration (this is what travis runs)
gulp.task( 'ci', (cb) => {
    // TODO run-sequence is obviated in gulp 4 via gulp.series
    require( 'run-sequence' )( 'clone', 'preflight', cb );
});
