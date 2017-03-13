'use strict';

// Core node modules
const path = require( 'path' );
const spawn = require( 'child_process' ).spawn;

// Public NPM modules
const assert = require( 'assert-plus' );
const Promise = require( 'bluebird' );

// Local modules
const ProcessError = require( './lib/ProcessError.js' );

require( './lib/polyfill.js' );


const standalonePath = path.join( __dirname, 'build', 'glslang', 'StandAlone' );


const glslang = {};

glslang.glslangValidatorAsync = options => {
    return execGlslangBinary( 'glslangValidator', options );
};

glslang.spirvRemapAsync = options => {
    return execGlslangBinary( 'spirv-remap', options );
};



/**
 * Launches a glslang executable
 * @param {string} binary The name of executable
 * @param {Object} options The options hash
 * @return {Promise} .
 */
function execGlslangBinary( binary, options ) {

    options = options || {};

    assert.object( options, 'The first argument must be an options hash/object.' );

    if ( Array.isArray( options.args ) ) {
        assert.arrayOfString( options.args, 'The options hash must contain an "args" key, with a string or array-of-strings value (array didn\'t contain strings).' );
    } else {
        assert.string( options.args, 'The options hash must contain an "args" key, with a string or array-of-strings value.' );
        options.args = [ options.args ];
    }


    return new Promise( (resolve, reject) => {

        const proc = spawn( path.join( standalonePath, binary ), options.args );

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
                resolve( code );
            } else {
                reject( new ProcessError( code ) );
            }
        });
    });
}


module.exports = glslang;
