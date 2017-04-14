'use strict';

/* eslint-disable require-jsdoc */

jest.autoMockOff();

jest.mock( './lib/spawnProcessAsync.js' );
jest.mock( 'node-cmake' );
jest.mock( 'async-exit-hook' );


require( 'node-cmake' ).mockImplementation( () => { return {}; } );

const compiler = require( './index.js' );
const spawnProcessAsyncMock = require( './lib/spawnProcessAsync.js' );


function installSpawnMockForSuccess( cb ) {

    spawnProcessAsyncMock.mockImplementationOnce( () => { return {
        then() {
            cb();
            return this;
        },

        catch() {
            cb();
            return this;
        }
    }; } );
}



describe( 'node-glsl-compiler', () => {
    it( 'is an object', () => {
        expect( compiler ).toEqual( jasmine.any( Object ) );
    });

    it( 'has a "standalone" property', () => {
        expect( compiler.standalone ).toBeTruthy();
    });
});


describe( 'node-glsl-compiler.standalone', () => {
    it( 'is an object', () => {
        expect( compiler.standalone ).toEqual( jasmine.any( Object ) );
    });

    it( 'has a "glslangValidatorAsync" property', () => {
        expect( compiler.standalone.glslangValidatorAsync ).toBeTruthy();
    });

    it( 'has a "spirvRemapAsync" property', () => {
        expect( compiler.standalone.spirvRemapAsync ).toBeTruthy();
    });
});


describe( 'node-glsl-compiler.standalone.glslangValidatorAsync', () => {

    it( 'is a function', () => {
        expect( compiler.standalone.glslangValidatorAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an options hash as the first argument', () => {
        const cb = () => {};
        expect( () => compiler.standalone.glslangValidatorAsync( 'not an options hash', cb ) ).toThrow();
        expect( () => compiler.standalone.glslangValidatorAsync( undefined, cb ) ).toThrow();

        installSpawnMockForSuccess( cb );
        expect( () => compiler.standalone.glslangValidatorAsync( {}, cb ) ).not.toThrow();
    });

    // white-box testing because the black-box form would be a pedantic and laborious duplication of spawnProcessAsync with little benefit...

    it( 'calls to spawnProcessAsync', () => {
        const options = {quiet: true};
        const cb = () => {};
        installSpawnMockForSuccess( cb );
        compiler.standalone.glslangValidatorAsync( options, cb );
        expect( spawnProcessAsyncMock ).toHaveBeenCalledWith( jasmine.stringMatching( /glslangValidator/ ), options );
    });


    it( 'calls the callback on success', () => {

        const cbMock = jest.fn();

        // installSpawnMockForSuccess( cb );

        let success;
        let failure;

        spawnProcessAsyncMock.mockImplementationOnce( () => { return {
            then( callback ) {
                success = callback;
                return this;
            },

            catch( callback ) {
                failure = callback;
                return this;
            }
        }; } );

        const err = new Error( 'some error' );


        expect( () => compiler.standalone.glslangValidatorAsync( {}, cbMock ) ).not.toThrow();
        expect( () => success() ).not.toThrow();
        expect( () => failure( err ) ).not.toThrow();

        expect( cbMock.mock.calls.length ).toBe( 2 );
        expect( cbMock.mock.calls[0] ).toEqual( [] );
        expect( cbMock.mock.calls[1] ).toEqual( [err] );
    });
});


describe( 'node-glsl-compiler.standalone.spirvRemapAsync', () => {

    it( 'is a function', () => {
        expect( compiler.standalone.spirvRemapAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an options hash as the first argument', () => {
        const cb = () => {};
        expect( () => compiler.standalone.spirvRemapAsync( 'not an options hash', cb ) ).toThrow();
        expect( () => compiler.standalone.spirvRemapAsync( undefined, cb ) ).toThrow();

        installSpawnMockForSuccess( cb );
        expect( () => compiler.standalone.spirvRemapAsync( {}, cb ) ).not.toThrow();
    });

    // white-box testing because the black-box form would be a pedantic and laborious duplication of spawnProcessAsync with little benefit...

    it( 'calls to spawnProcessAsync', () => {
        const options = {quiet: true};
        const cb = () => {};
        installSpawnMockForSuccess( cb );
        compiler.standalone.spirvRemapAsync( options, cb );
        expect( spawnProcessAsyncMock ).toHaveBeenCalledWith( jasmine.stringMatching( /spirv-remap/ ), options );
    });


    it( 'calls the callback on success', () => {

        const cbMock = jest.fn();

        let success;
        let failure;

        spawnProcessAsyncMock.mockImplementationOnce( () => { return {
            then( callback ) {
                success = callback;
                return this;
            },

            catch( callback ) {
                failure = callback;
                return this;
            }
        }; } );

        const err = new Error( 'some error' );


        expect( () => compiler.standalone.spirvRemapAsync( {}, cbMock ) ).not.toThrow();
        expect( () => success() ).not.toThrow();
        expect( () => failure( err ) ).not.toThrow();

        expect( cbMock.mock.calls.length ).toBe( 2 );
        expect( cbMock.mock.calls[0] ).toEqual( [] );
        expect( cbMock.mock.calls[1] ).toEqual( [err] );
    });
});
