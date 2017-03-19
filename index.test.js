'use strict';

/* eslint-disable require-jsdoc */

jest.autoMockOff();

jest.mock( './lib/spawnProcessAsync.js' );
jest.mock( 'node-cmake' );
jest.mock( 'async-exit-hook' );


require( 'node-cmake' ).mockImplementation( () => { return {}; } );

const glslang = require( './index.js' );
const spawnProcessAsyncMock = require( './lib/spawnProcessAsync.js' );


function installSpawnMockForSuccess( cb ) {

    spawnProcessAsyncMock.mockImplementationOnce( () => { return {
        then() {
            cb();
            return this;
        },

        catch( err ) {
            cb( err );
            return this;
        }
    }; } );
}



describe( 'node-glslang', () => {
    it( 'is an object', () => {
        expect( glslang ).toEqual( jasmine.any( Object ) );
    });

    it( 'has a "standalone" property', () => {
        expect( glslang.standalone ).toBeTruthy();
    });
});


describe( 'node-glslang.standalone', () => {
    it( 'is an object', () => {
        expect( glslang.standalone ).toEqual( jasmine.any( Object ) );
    });

    it( 'has a "glslangValidatorAsync" property', () => {
        expect( glslang.standalone.glslangValidatorAsync ).toBeTruthy();
    });

    it( 'has a "spirvRemapAsync" property', () => {
        expect( glslang.standalone.spirvRemapAsync ).toBeTruthy();
    });
});


describe( 'node-glslang.standalone.glslangValidatorAsync', () => {

    it( 'is a function', () => {
        expect( glslang.standalone.glslangValidatorAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an options hash as the first argument', () => {
        const cb = () => {};
        expect( () => glslang.standalone.glslangValidatorAsync( 'not an options hash', cb ) ).toThrow();
        expect( () => glslang.standalone.glslangValidatorAsync( undefined, cb ) ).toThrow();

        installSpawnMockForSuccess( cb );
        expect( () => glslang.standalone.glslangValidatorAsync( {}, cb ) ).not.toThrow();
    });

    // white-box testing because the black-box form would be a pedantic and laborious duplication of spawnProcessAsync with little benefit...

    it( 'calls to spawnProcessAsync', () => {
        const options = {quiet: true};
        const cb = () => {};
        installSpawnMockForSuccess( cb );
        glslang.standalone.glslangValidatorAsync( options, cb );
        expect( spawnProcessAsyncMock ).toHaveBeenCalledWith( jasmine.stringMatching( /glslangValidator/ ), options );
    });
});


describe( 'node-glslang.standalone.spirvRemapAsync', () => {

    it( 'is a function', () => {
        expect( glslang.standalone.spirvRemapAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an options hash as the first argument', () => {
        const cb = () => {};
        expect( () => glslang.standalone.spirvRemapAsync( 'not an options hash', cb ) ).toThrow();
        expect( () => glslang.standalone.spirvRemapAsync( undefined, cb ) ).toThrow();

        installSpawnMockForSuccess( cb );
        expect( () => glslang.standalone.spirvRemapAsync( {}, cb ) ).not.toThrow();
    });

    // white-box testing because the black-box form would be a pedantic and laborious duplication of spawnProcessAsync with little benefit...

    it( 'calls to spawnProcessAsync', () => {
        const options = {quiet: true};
        const cb = () => {};
        installSpawnMockForSuccess( cb );
        glslang.standalone.spirvRemapAsync( options, cb );
        expect( spawnProcessAsyncMock ).toHaveBeenCalledWith( jasmine.stringMatching( /spirv-remap/ ), options );
    });
});
