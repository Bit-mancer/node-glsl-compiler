'use strict';

/**
 * @module node-glslang
 */

// Core node modules
const path = require( 'path' );
const spawn = require( 'child_process' ).spawn;

// Public NPM modules
const assert = require( 'assert-plus' );
const Promise = require( 'bluebird' );

// Local modules
const ProcessError = require( './lib/ProcessError.js' );

require( './lib/polyfill.js' );



module.exports = { standalone: {} };

const kStandAlonePath = path.join( __dirname, 'build', 'glslang', 'StandAlone' );


/**
 * Asynchronously calls the stand-alone glslangValidator executable.
 *
 * This method is provided as a mechanism to use glslang functionality that is not exposed via the regular node-glslang API.
 * @param {Object} options Options hash containing the following keys:
 * * `args` __(required)__ a string, or an array of strings, to pass to the executable.
 * * `stdout` _(optional)_ a callback function that receives a {@linkcode Buffer} parameter whenever the executable writes data to stdout.
 * * `stderr` _(optional)_ a callback function that receives a {@linkcode Buffer} parameter whenever the executable writes data to stderr.
 * @returns {Promise} A {@linkcode Promise}; the resolver receives nothing, and the rejector receives an {@linkcode AssertionError} (if the options hash is malformed) or a {@link ProcessError}.
 * @example
 * // terminal equivalent (create SPIR-V binary under GL semantics, output to vert.spv, input pass.vert):
 * //     glslangValidator -G -o vert.spv pass.vert
 * const glslang = require( 'node-glslang' );
 * glslang.standalone.glslangValidatorAsync( { args: ['-G', '-o', 'vert.spv', 'pass.vert'] } )
 * .then( () => {
 *     // ...
 * }).catch( err => {
 *     // ...
 * });
 * @example
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
module.exports.standalone.glslangValidatorAsync = options => {
    return execGlslangBinary( 'glslangValidator', options );
};


/**
 * Asynchronously calls the stand-alone spirv-remap executable.
 *
 * This method is provided as a mechanism to use glslang functionality that is not exposed via the regular node-glslang API.
 * @param {Object} options Options hash containing the following keys:
 * * `args` __(required)__ a string, or an array of strings, to pass to the executable.
 * * `stdout` _(optional)_ a callback function that receives a {@linkcode Buffer} parameter whenever the executable writes data to stdout.
 * * `stderr` _(optional)_ a callback function that receives a {@linkcode Buffer} parameter whenever the executable writes data to stderr.
 * @returns {Promise} A {@linkcode Promise}; the resolver receives nothing, and the rejector receives an {@linkcode AssertionError} (if the options hash is malformed) or a {@link ProcessError}.
 * @example
 * // terminal equivalent (perform all optimizations, input vert.spv, output to directory ./output):
 * //     spirv-remap --do-everything --input vert.spv -o ./output
 * const glslang = require( 'node-glslang' );
 * glslang.standalone.spirvRemapAsync( { args: ['--do-everything', '--input', 'vert.spv', '-o', './output'] } )
 * .then( () => {
 *     // ...
 * }).catch( err => {
 *     // ...
 * });
 * @example
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
module.exports.standalone.spirvRemapAsync = options => {
    return execGlslangBinary( 'spirv-remap', options );
};



/**
 * Launches a glslang executable
 * @param {string} binary The name of executable
 * @param {Object} options The options hash
 * @return {Promise} .
 * @private
 */
function execGlslangBinary( binary, options ) {

    return new Promise( (resolve, reject) => {

        options = options || {};

        assert.object( options, 'The first argument must be an options hash/object.' );

        if ( Array.isArray( options.args ) ) {
            assert.arrayOfString( options.args, 'The options hash must contain an "args" key, with a string or array-of-strings value (array didn\'t contain strings).' );
        } else {
            assert.string( options.args, 'The options hash must contain an "args" key, with a string or array-of-strings value.' );
            options.args = [ options.args ];
        }


        const proc = spawn( path.join( kStandAlonePath, binary ), options.args );

        if ( options.stdout ) {
            assert.func( options.stdout, `"options.stdout" must be a function (was of type ${typeof options.stdout})` );
            proc.stdout.on( 'data', options.stdout );
        }

        if ( options.stderr ) {
            assert.func( options.stderr, `"options.stderr" must be a function (was of type ${typeof options.stderr})` );
            proc.stderr.on( 'data', options.stderr );
        }


        let spawnError;

        proc.on( 'error', (err) => {
            spawnError = err;
        });


        proc.on( 'close', (code) => {

            if ( spawnError ) {
                reject( new ProcessError( code, `Failed to spawn child process: ${spawnError.message}\n${spawnError.stack}` ) );
                return;
            }

            if ( code === 0 ) {
                resolve();
            } else {
                reject( new ProcessError( code ) );
            }
        });
    });
}
