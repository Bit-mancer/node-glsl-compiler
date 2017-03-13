'use strict';

jest.autoMockOff();

const ProcessError = require( '../../lib/ProcessError.js' );

describe( 'ProcessError', () => {
    it( 'is a function', () => {
        expect( ProcessError ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an exit code as the first argument', () => {
        expect( () => new ProcessError() ).toThrow();
        expect( () => new ProcessError( 'not a number' ) ).toThrow();
        expect( () => new ProcessError( 1 ) ).not.toThrow();
    });

    it( 'can accept an optional second string message argument', () => {
        expect( () => new ProcessError( 1, 42 ) ).toThrow();
        expect( () => new ProcessError( 1, 'message' ) ).not.toThrow();
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
});
