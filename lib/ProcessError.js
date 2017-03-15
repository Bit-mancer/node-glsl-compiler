'use strict';

const assert = require( 'assert-plus' );
const EOL = require( 'os' ).EOL;

/**
 * Indicates a failure in a child process.
 */
class ProcessError extends Error {

    /**
     * Constructs a new instance of the {@link ProcessError} class.
     *
     * At least one of "code" or "signal" must be truthy.
     *
     * @param {Number} code Optional process exit code.
     * @param {String} signal Optional process termination signal.
     * @param {String} message Optional error message.
     */
    constructor( code, signal, message ) {

        assert.optionalNumber( code );
        assert.optionalString( signal );
        assert.optionalString( message );

        assert( code || signal, 'At least one of "code" or "signal" must be truthy' );

        if ( message ) {
            super( message );
        } else {
            super();
        }

        /**
         * Class name.
         * @public
         */
        this.name = this.constructor.name;

        /**
         * Process exit code. May be falsy.
         * @public
         */
        this.code = code;

        /**
         * The signal that terminated the process. May be falsy.
         * @public
         */
        this.signal = signal;
    }


    toString() {

        // This implementation follows Object.prototype.toString()

        const obj = Object( this );
        if ( obj !== this ) {
            throw new TypeError();
        }

        let name = this.name;
        name = (name === undefined) ? 'ProcessError' : String( name );

        let msg = this.message;
        msg = (msg === undefined) ? '' : String( msg );


        const s = [];
        if ( name === '' ) {
            s.push( msg );
        } else if ( msg === '' ) {
            s.push( name );
        } else {
            s.push( `${name}: ${msg}` );
        }

        if ( this.code ) {
            s.push( `${EOL}Code: ${this.code}` );
        }

        if ( this.signal ) {
            s.push( `${EOL}Signal: ${this.signal}` );
        }

        return s.join( '' );
    }
}


module.exports = ProcessError;
