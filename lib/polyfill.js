'use strict';

/**
 * Polyfills to support older versions of node
 */

if ( ! Array.isArray ) {
    Array.isArray = function( arg ) {
        return Object.prototype.toString.call( arg ) === '[object Array]';
    };
}
