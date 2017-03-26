'use strict';

/* eslint-disable require-jsdoc */

jest.autoMockOff();

describe( 'polyfill', () => {

    let previous;

    beforeEach( () => {
        previous = Array.isArray;
        Array.isArray = undefined;
    });

    afterEach( () => {
        Array.isArray = previous;
    });

    it( 'with Array.isArray removed (if applicable), and without polyfill, Array.isArray does not exist', () => {
        expect( Array.isArray ).toEqual( undefined );
    });

    it( 'with Array.isArray removed (if applicable), and with polyfill, Array.isArray does exist', () => {
        require( './polyfill.js' );
        expect( Array.isArray ).toEqual( jasmine.any( Function ) );
        expect( () => Array.isArray( undefined ) ).not.toThrow();
        expect( Array.isArray( 'not an array' ) ).toBeFalsy();
        expect( Array.isArray( {} ) ).toBeFalsy();
        expect( Array.isArray( [] ) ).toBeTruthy();
        expect( Array.isArray( ['1'] ) ).toBeTruthy();
    });
});
