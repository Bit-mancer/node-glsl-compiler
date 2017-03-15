'use strict';

// Core node modules
const path = require( 'path' );

// Public NPM modules

// Local modules
const spawnAsync = require( './lib/spawnProcessAsync.js' );


const kStandAlonePath = path.join( __dirname, 'build', 'glslang', 'StandAlone' );


/**
 * The main node-glslang module.
 * @module node-glslang
 * @example
 * const glslang = require( 'node-glslang' );
 * glslang.standalone.glslangValidatorAsync( { ... } );
 */
module.exports = {

    /**
     * @exports node-glslang.standalone
     */
    standalone: {

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
         * @returns {Promise} A promise object that is "duck"-compatible with ES6 Promise ({@link http://bluebirdjs.com/ Bluebird}). The resolver receives nothing, and the rejector receives an {@linkcode AssertionError} (if the options hash is malformed), or a {@link ProcessError} (if there is an error launching or terminating the child process). The promise will throw if an error is raised and no catch() handler has been attached.
         * @example <caption>Basic example:</caption>
         * // terminal equivalent (create SPIR-V binary under GL semantics, output to vert.spv, input pass.vert):
         * //     glslangValidator -G -o vert.spv pass.vert
         * const glslang = require( 'node-glslang' );
         * glslang.standalone.glslangValidatorAsync( { args: ['-G', '-o', 'vert.spv', 'pass.vert'] } )
         * .then( () => {
         *     // ...
         * }).catch( err => {
         *     // ...
         * });
         * @example <caption>Send child process stdout and stderr to the console:</caption>
         * const glslang = require( 'node-glslang' );
         * glslang.standalone.glslangValidatorAsync( {
         *     args: ['-G', '-o', 'vert.spv', 'pass.vert'],
         *     console: true
         * }).then( () => {
         *     // ...
         * }).catch( err => {
         *     // ...
         * });
         * @example <caption>Handle stdout ourselves (stderr will be ignored in this case):</caption>
         * const glslang = require( 'node-glslang' );
         * glslang.standalone.glslangValidatorAsync( {
         *     args: ['-G', '-o', 'vert.spv', 'pass.vert'],
         *     stdout: buffer => console.log( buffer.toString() )
         * }).then( () => {
         *     // ...
         * }).catch( err => {
         *     // ...
         * });
         * @see {@link https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/}
         * @see {@link https://github.com/KhronosGroup/glslang}
         * @public
         */
        glslangValidatorAsync( options ) {
            // return execGlslangBinary( 'glslangValidator', options );
            return spawnAsync( path.join( kStandAlonePath, 'glslangValidator' ), options );
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
         * @returns {Promise} A promise object that is "duck"-compatible with ES6 Promise ({@link http://bluebirdjs.com/ Bluebird}). The resolver receives nothing, and the rejector receives an {@linkcode AssertionError} (if the options hash is malformed), or a {@link ProcessError} (if there is an error launching or terminating the child process). The promise will throw if an error is raised and no catch() handler has been attached.
         * @example <caption>Basic example:</caption>
         * // terminal equivalent (perform all optimizations, input vert.spv, output to directory ./output):
         * //     spirv-remap --do-everything --input vert.spv -o ./output
         * const glslang = require( 'node-glslang' );
         * glslang.standalone.spirvRemapAsync( { args: ['--do-everything', '--input', 'vert.spv', '-o', './output'] } )
         * .then( () => {
         *     // ...
         * }).catch( err => {
         *     // ...
         * });
         * @example <caption>Send child process stdout and stderr to the console:</caption>
         * const glslang = require( 'node-glslang' );
         * glslang.standalone.spirvRemapAsync( {
         *     args: ['--do-everything', '--input', 'vert.spv', '-o', './output'],
         *     console: true
         * }).then( () => {
         *     // ...
         * }).catch( err => {
         *     // ...
         * });
         * @example <caption>Handle stdout ourselves (stderr will be ignored in this case):</caption>
         * const glslang = require( 'node-glslang' );
         * glslang.standalone.spirvRemapAsync( {
         *     args: ['--do-everything', '--input', 'vert.spv', '-o', './output'],
         *     stdout: buffer => console.log( buffer.toString() )
         * }).then( () => {
         *     // ...
         * }).catch( err => {
         *     // ...
         * });
         * @see {@link https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/}
         * @see {@link https://github.com/KhronosGroup/glslang/blob/master/README-spirv-remap.txt}
         * @public
         */
        spirvRemapAsync( options ) {
            return spawnAsync( path.join( kStandAlonePath, 'spirv-remap' ), options );
        }
    }
};
