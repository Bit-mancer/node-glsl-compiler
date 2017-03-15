'use strict';

/* eslint-disable require-jsdoc */

jest.autoMockOff();

const ProcessError = require( './ProcessError.js' );

describe( 'ProcessError', () => {
    it( 'is a function', () => {
        expect( ProcessError ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an exit code as the first argument', () => {
        expect( () => new ProcessError() ).toThrow();
        expect( () => new ProcessError( 'not a number' ) ).toThrow();
        expect( () => new ProcessError( 1 ) ).not.toThrow();
    });

    it( 'can accept an optional second string signal argument', () => {
        expect( () => new ProcessError( 1, 42 ) ).toThrow();
        expect( () => new ProcessError( 1, 'SOMESIG' ) ).not.toThrow();
    });

    it( 'can accept an optional third string message argument; if provided, the message is passed to the Error class constructor', () => {
        expect( () => new ProcessError( 1, 'SOMESIG', 'message' ) ).not.toThrow();
        expect( new ProcessError( 1, 'SOMESIG' ).message ).toBeFalsy();
        expect( new ProcessError( 1, 'SOMESIG', 'test' ).message ).toEqual( 'test' );
    });

    it( 'requires either an exit code (first arg) or a signal (second arg) to be truthy', () => {
        expect( () => new ProcessError() ).toThrow();
        expect( () => new ProcessError( null, null ) ).toThrow();
        expect( () => new ProcessError( 1, null ) ).not.toThrow();
        expect( () => new ProcessError( 1, undefined ) ).not.toThrow();
        expect( () => new ProcessError( null, 'SOMESIG' ) ).not.toThrow();
        expect( () => new ProcessError( undefined, 'SOMESIG' ) ).not.toThrow();
        expect( () => new ProcessError( 1, 'SOMESIG' ) ).not.toThrow();
    });

    it( 'constructs an Error-derived object', () => {
        const error = new ProcessError( 1 );
        expect( error ).toEqual( jasmine.any( Object ) );
        expect( error instanceof Error ).toBeTruthy();
    });

    it( 'has a "name" property identifying the constructor', () => {
        let error = new ProcessError( 1 );
        expect( error.name ).toEqual( 'ProcessError' );
    });

    it( 'has a "code" property', () => {
        const error = new ProcessError( 42 );
        expect( error.code ).toEqual( 42 );
    });

    it( 'has a "signal" property', () => {
        const error = new ProcessError( 42, 'SOMESIG' );
        expect( error.signal ).toEqual( 'SOMESIG' );
    });

    it( 'overrides the toString method', () => {

        expect( () => ProcessError.prototype.toString.call( 42 ) ).toThrowError( TypeError );

        expect( new ProcessError( 42 ).toString() ).toEqual( expect.stringMatching( /Code: 42/ ) );
        expect( new ProcessError( 42, undefined, 'msg' ).toString() ).toEqual( expect.stringMatching( /msg((.|\n)*)Code: 42/ ) );
        expect( new ProcessError( undefined, 'SOMESIG' ).toString() ).toEqual( expect.stringMatching( /Signal: SOMESIG/ ) );
        expect( new ProcessError( undefined, 'SOMESIG', 'msg' ).toString() ).toEqual( expect.stringMatching( /msg((.|\n)*)Signal: SOMESIG/ ) );
        expect( new ProcessError( 42, 'SOMESIG' ).toString() ).toEqual( expect.stringMatching( /Code: 42((.|\n)*)Signal: SOMESIG/ ) );
        expect( new ProcessError( 42, 'SOMESIG', 'msg' ).toString() ).toEqual( expect.stringMatching( /msg((.|\n)*)Code: 42((.|\n)*)Signal: SOMESIG/ ) );

        const e = new ProcessError( 42, undefined, 'msg' );
        e.name = undefined;
        expect( e.toString() ).toEqual( expect.stringMatching( /msg((.|\n)*)Code: 42/ ) );
    });
});
