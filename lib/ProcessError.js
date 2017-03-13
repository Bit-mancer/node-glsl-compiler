'use strict';

const assert = require( 'assert-plus' );

/**
 * Indicates a failure in a child process.
 */
class ProcessError extends Error {

    constructor( code, message ) {

        assert.number( code );
        assert.optionalString( message );

        if ( message ) {
            super( message );
        } else {
            super( `exit code ${code}` );
        }

        /**
         * Class name.
         * @public
         */
        this.name = this.constructor.name;

        /**
         * Process exit code.
         * @public
         */
        this.code = code;
    }
}


module.exports = ProcessError;
