'use strict';

/* eslint-disable require-jsdoc */

jest.autoMockOff();

jest.mock( 'child_process' );
const spawn = require( 'child_process' ).spawn;

const AssertionError = require( 'assert' ).AssertionError;
const Promise = require( 'bluebird' );
const ProcessError = require( './ProcessError.js' );
const spawnAsync = require( './spawnProcessAsync.js' );

describe( 'spawnProcessAsync', () => {

    let spawnMock;
    let command;
    let args;

    function emitCloseEvent( code, signal ) {
        process.nextTick( () => spawnMock.on.mock.calls[1][1]( code, signal ) );
    }

    beforeEach( () => {
        spawnMock = {
            on: jest.fn(),
            stdout: {
                on: jest.fn()
            },
            stderr: {
                on: jest.fn()
            }
        };

        command = undefined;
        args = undefined;

        spawn.mockImplementationOnce( (c, a) => {
            command = c;
            args = a;
            return spawnMock;
        });
    } );

    it( 'is a function', () => {
        expect( spawnAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'returns a Bluebird Promise', () => {
        const promise = spawnAsync( 'test', '1' );

        expect( promise ).toEqual( jasmine.any( Promise ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'fulfills the Promise if the child process terminates with a zero exit code', () => {
        const promise = spawnAsync( 'test', '1' )
        .then( arg => {
            expect( arg ).toEqual( undefined );
        });

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'rejects the Promise with a ProcessError if the child process terminates with a non-zero exit code', cb => {

        spawnAsync( 'test', '1' )
        .then( () => fail( 'should not have been called' ) )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( ProcessError ) );
            expect( err.code ).toEqual( 1 );
            expect( err.signal ).toBeFalsy();
            cb();
        });

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 1 );
    });

    it( 'spawns the specified command with the specified arguments', () => {

        const promise = spawnAsync( 'test', {args: ['1', '-gt', '0'], quiet: true} )
        .then( arg => {
            expect( arg ).toEqual( undefined );
            expect( command ).toEqual( 'test' );
            expect( args ).toEqual( ['1', '-gt', '0'] );
        });

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'requires a string path to the executable to spawn as the first argument -- failure', () => {
        return spawnAsync()
        .then( () => fail( 'should not have been called' ) )
        .catch( err => expect( err ).toEqual( jasmine.any( AssertionError ) ) );
    });

    it( 'requires a string path to the executable to spawn as the first argument -- success', () => {
        const promise = spawnAsync( 'echo' )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept a single argument string as the second argument', () => {
        const promise = spawnAsync( 'echo', 'test' )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an array of string arguments as the second argument', () => {
        const promise = spawnAsync( 'echo', ['test', 'test2'] )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an options hash as the second argument', () => {
        const promise = spawnAsync( 'echo', {} )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'rejects invalid types for the second argument', () => {
        return spawnAsync( 'echo', 42 )
        .then( () => fail( 'should not have been called' ) )
        .catch( err => expect( err ).toEqual( jasmine.any( AssertionError ) ) );
    });

    it( 'can accept an options hash as the second argument, which can include an "args" key and string or array-of-strings value -- failure 1', () => {
        return spawnAsync( 'echo', { args: 42 } )
        .then( () => fail( 'should not have been called' ) )
        .catch( err => expect( err ).toEqual( jasmine.any( AssertionError ) ) );
    });

    it( 'can accept an options hash as the second argument, which can include an "args" key and string or array-of-strings value -- failure 2', () => {
        return spawnAsync( 'echo', { args: [ 42 ] } )
        .then( () => fail( 'should not have been called' ) )
        .catch( err => expect( err ).toEqual( jasmine.any( AssertionError ) ) );
    });

    it( 'can accept an options hash as the second argument, which can include an "args" key and string or array-of-strings value -- success 1', () => {
        const promise = spawnAsync( 'echo', { args: 'test' } )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an options hash as the second argument, which can include an "args" key and string or array-of-strings value -- success 2', () => {
        const promise = spawnAsync( 'echo', { args: ['test'] } )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an options hash as the second argument, which can include a "stdout" key and function value -- failure', () => {
        return spawnAsync( 'echo', { stdout: 'not a func' } )
        .then( () => fail( 'should not have been called' ) )
        .catch( err => expect( err ).toEqual( jasmine.any( AssertionError ) ) );
    });

    it( 'can accept an options hash as the second argument, which can include a "stdout" key and function value -- success', () => {
        const stdoutMock = jest.fn();
        const promise = spawnAsync( 'echo', { stdout: stdoutMock, quiet: true } )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        expect( spawnMock.stdout.on.mock.calls.length ).toBe( 1 );
        expect( spawnMock.stdout.on.mock.calls[0] ).toEqual( ['data', stdoutMock] );

        process.nextTick( () => {
            spawnMock.stdout.on.mock.calls[0][1]( 'some text' );
            expect( stdoutMock.mock.calls.length ).toBe( 1 );
            expect( stdoutMock.mock.calls[0] ).toEqual( ['some text'] );
        });

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an options hash as the second argument, which can include a "stderr" key and function value -- failure', () => {
        return spawnAsync( 'echo', { stderr: 'not a func' } )
        .then( () => fail( 'should not have been called' ) )
        .catch( err => expect( err ).toEqual( jasmine.any( AssertionError ) ) );
    });

    it( 'can accept an options hash as the second argument, which can include a "stderr" key and function value -- success', () => {
        const stderrMock = jest.fn();
        const promise = spawnAsync( 'echo', { stderr: stderrMock, quiet: true } )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        expect( spawnMock.stderr.on.mock.calls.length ).toBe( 1 );
        expect( spawnMock.stderr.on.mock.calls[0] ).toEqual( ['data', stderrMock] );

        process.nextTick( () => {
            spawnMock.stderr.on.mock.calls[0][1]( 'some text' );
            expect( stderrMock.mock.calls.length ).toBe( 1 );
            expect( stderrMock.mock.calls[0] ).toEqual( ['some text'] );
        });

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an options hash as the second argument, which can include a "quiet" key and bool value -- chatty by default', () => {

        const promise = spawnAsync( 'echo' )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        expect( spawnMock.stdout.on.mock.calls.length ).toBe( 1 );
        expect( spawnMock.stdout.on.mock.calls[0] ).toEqual( ['data', jasmine.any( Function )] );
        expect( spawnMock.stderr.on.mock.calls.length ).toBe( 1 );
        expect( spawnMock.stderr.on.mock.calls[0] ).toEqual( ['data', jasmine.any( Function )] );

        emitCloseEvent( 0 );
        return promise;
    });

    it( 'can accept an options hash as the second argument, which can include a "quiet" key and bool value -- success', () => {

        const promise = spawnAsync( 'echo', { quiet: true } )
        .then( res => expect( res ).toEqual( undefined ) )
        .catch( () => fail( 'should not have been called' ) );

        expect( spawnMock.on.mock.calls.length ).toBe( 2 );
        expect( spawnMock.on.mock.calls[0] ).toEqual( ['error', jasmine.any( Function )] );
        expect( spawnMock.on.mock.calls[1] ).toEqual( ['close', jasmine.any( Function )] );

        expect( spawnMock.stdout.on.mock.calls.length ).toBe( 0 );
        expect( spawnMock.stderr.on.mock.calls.length ).toBe( 0 );

        emitCloseEvent( 0 );
        return promise;
    });
});
