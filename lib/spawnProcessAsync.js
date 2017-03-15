'use strict';

// Core node modules
const spawn = require( 'child_process' ).spawn;

// Public NPM modules
const assert = require( 'assert-plus' );
const Promise = require( 'bluebird' );

// Local modules
const ProcessError = require( './ProcessError.js' );

require( './polyfill.js' );


module.exports = function spawnProcessAsync( pathToBinary, options ) {

    return new Promise( (resolve, reject) => {

        assert.string( pathToBinary, 'The first argument must be a string path to the executable to spawn' );

        let args = [];

        // options is nominally an options hash, but we'll allow options.args to be lifted upwards and take the place
        // of the hash -- therefore options can be: an options hash, a string (a single command arg), or an
        // array-of-strings (multiple args)
        if ( options ) {
            if ( typeof options === 'string' ) {
                args = [ options ];
                options = {};
            } else if ( Array.isArray( options ) ) {
                assert.arrayOfString( options, 'Command line args must be a string or an array-of-strings value (array didn\'t contain strings).' );

                args = options;
                options = {};
            } else if ( typeof options === 'object' ) {
                if ( options.args ) {
                    if ( Array.isArray( options.args ) ) {
                        assert.arrayOfString( options.args, 'If the optional "args" key is provided in the options hash, the value must be a string or an array-of-strings value (array didn\'t contain strings).' );
                        args = options.args;
                    } else {
                        assert.string( options.args, 'If the optional "args" key is provided in the options hash, the value must be a string or an array-of-strings value.' );
                        args = [ options.args ];
                    }
                }
            } else {
                assert.fail( undefined, undefined, 'The second argument must be an options hash/object, a string, or an array-of-strings.' );
            }
        } else {
            options = {};
        }


        const proc = spawn( pathToBinary, args );

        if ( ! options.quiet ) {
            proc.stdout.on( 'data', buffer => process.stdout.write( buffer ) );
            proc.stderr.on( 'data', buffer => process.stderr.write( buffer ) );
        }

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

        // wait for streams to close ('close') rather than process exit ('exit') because we control the streams
        // and close should be reliably called (exit may or may not be emitted if the error event is emitted)
        proc.on( 'close', (code, signal) => {

            if ( spawnError ) {
                reject( new ProcessError( code, signal, `Failure spawning or terminating ${pathToBinary}: ${spawnError.message}\n${spawnError.stack}` ) );
                return;
            }

            if ( code === 0 ) {
                resolve();
            } else {
                if ( signal ) {
                    reject( new ProcessError( code, signal, `Process ${pathToBinary} terminated by signal ${signal}` ) );
                } else {
                    reject( new ProcessError( code, signal, `Process ${pathToBinary} exited with code ${code}` ) );
                }
            }
        });
    });
};
