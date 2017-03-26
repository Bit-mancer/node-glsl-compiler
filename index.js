'use strict';

// Core node modules
const path = require( 'path' );

// Public NPM modules
const assert = require( 'assert-plus' );

// Local modules
const spawnAsync = require( './lib/spawnProcessAsync.js' );


/**
 * The main node-glslang module.
 * @module node-glslang
 * @example
 * const glslang = require( 'node-glslang' );
 * glslang.standalone.glslangValidatorAsync( { ... } );
 */
module.exports = require( 'node-cmake' )( 'node_glslang' );

assert.ok( ! module.exports.standalone );


/* istanbul ignore next */
require( 'async-exit-hook' )( cb => {
    module.exports.private_finalizeProcess( () => {
        cb();
    });
});


const kStandAlonePath = path.join( __dirname, 'build', 'glslang', 'StandAlone' );


/**
 * @exports node-glslang.standalone
 */
module.exports.standalone = {

    /**
     * Asynchronously calls the stand-alone glslangValidator executable.
     *
     * By default, the child process stdout and stderr are written to the parent process streams (see the {@linkcode quiet} option).
     *
     * This method is provided as a mechanism to use glslang functionality that is not exposed via the regular node-glslang API.
     * @param {Object} options Options hash containing the following keys:
     * * `args` __(optional)__ _String or Array-of-strings_ -- The arguments to pass to the executable.
     * * `quiet` __(optional)__ _Boolean_ -- if true, the child process stdout and stderr will NOT be written to the parent process streams (_default: false_).
     * * `stdout` __(optional)__ _Function_ -- a callback that receives a {@linkcode Buffer} parameter whenever the child process writes data to stdout.
     * * `stderr` __(optional)__ _Function_ -- a callback that receives a {@linkcode Buffer} parameter whenever the child process writes data to stderr.
     * @param {Function} cb A node-style callback function in the form `cb( error )`.
     * @example <caption>Basic example:</caption>
     * // terminal equivalent (create SPIR-V binary under GL semantics, output to vert.spv, input pass.vert):
     * //     glslangValidator -G -o vert.spv pass.vert
     * const glslang = require( 'node-glslang' );
     * glslang.standalone.glslangValidatorAsync( { args: ['-G', '-o', 'vert.spv', 'pass.vert'] }, err => {
     *     if ( err ) {
     *         // failure
     *     } else {
     *         // success
     *     }
     * });
     * @example <caption>Send child process stdout and stderr to the console:</caption>
     * const glslang = require( 'node-glslang' );
     * glslang.standalone.glslangValidatorAsync(
     *     {
     *         args: ['-G', '-o', 'vert.spv', 'pass.vert'],
     *         console: true
     *     }, err => {
     *         if ( err ) {
     *             // failure
     *         } else {
     *             // success
     *         }
     *     });
     * @example <caption>Handle stdout ourselves (stderr will be ignored in this case):</caption>
     * const glslang = require( 'node-glslang' );
     * glslang.standalone.glslangValidatorAsync(
     *     {
     *         args: ['-G', '-o', 'vert.spv', 'pass.vert'],
     *         stdout: buffer => console.log( buffer.toString() )
     *     }, err => {
     *         if ( err ) {
     *             // failure
     *         } else {
     *             // success
     *         }
     *     });
     * @see {@link https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/}
     * @see {@link https://github.com/KhronosGroup/glslang}
     * @public
     */
    glslangValidatorAsync( options, cb ) {

        // spawnAsync will do its own validation, so let's just cover the basics
        assert.object( options, 'The first argument is expected to be an options hash.' );
        assert.func( cb, 'The second argument is expected to be a callback function.' );

        spawnAsync( path.join( kStandAlonePath, 'glslangValidator' ), options )
        .then( () => cb() )
        .catch( err => cb( err ) );
    },


    /**
     * Asynchronously calls the stand-alone spirv-remap executable.
     *
     * By default, the child process stdout and stderr are written to the parent process streams (see the {@linkcode quiet} option).
     *
     * This method is provided as a mechanism to use glslang functionality that is not exposed via the regular node-glslang API.
     * @param {Object} options Options hash containing the following keys:
     * * `args` __(optional)__ _String or Array-of-strings_ -- The arguments to pass to the executable.
     * * `quiet` __(optional)__ _Boolean_ -- if true, the child process stdout and stderr will NOT be written to the parent process streams (_default: false_).
     * * `stdout` __(optional)__ _Function_ -- a callback that receives a {@linkcode Buffer} parameter whenever the child process writes data to stdout.
     * * `stderr` __(optional)__ _Function_ -- a callback that receives a {@linkcode Buffer} parameter whenever the child process writes data to stderr.
     * @param {Function} cb A node-style callback function in the form `cb( error )`.
     * @example <caption>Basic example:</caption>
     * // terminal equivalent (perform all optimizations, input vert.spv, output to directory ./output):
     * //     spirv-remap --do-everything --input vert.spv -o ./output
     * const glslang = require( 'node-glslang' );
     * glslang.standalone.spirvRemapAsync( { args: ['--do-everything', '--input', 'vert.spv', '-o', './output'] }, err => {
     *     if ( err ) {
     *         // failure
     *     } else {
     *         // success
     *     }
     * });
     * @example <caption>Send child process stdout and stderr to the console:</caption>
     * const glslang = require( 'node-glslang' );
     * glslang.standalone.spirvRemapAsync(
     *     {
     *         args: ['--do-everything', '--input', 'vert.spv', '-o', './output'],
     *         console: true
     *     }, err => {
     *         if ( err ) {
     *             // failure
     *         } else {
     *             // success
     *         }
     *     });
     * @example <caption>Handle stdout ourselves (stderr will be ignored in this case):</caption>
     * const glslang = require( 'node-glslang' );
     * glslang.standalone.spirvRemapAsync( {
     *         args: ['--do-everything', '--input', 'vert.spv', '-o', './output'],
     *         stdout: buffer => console.log( buffer.toString() )
     *     }, err => {
     *         if ( err ) {
     *             // failure
     *         } else {
     *             // success
     *         }
     *     });
     * @see {@link https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/}
     * @see {@link https://github.com/KhronosGroup/glslang/blob/master/README-spirv-remap.txt}
     * @public
     */
    spirvRemapAsync( options, cb ) {

        // spawnAsync will do its own validation, so let's just cover the basics
        assert.object( options, 'The first argument is expected to be an options hash.' );
        assert.func( cb, 'The second argument is expected to be a callback function.' );

        spawnAsync( path.join( kStandAlonePath, 'spirv-remap' ), options )
        .then( () => cb() )
        .catch( err => cb( err ) );
    }
};
