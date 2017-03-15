'use strict';

/* eslint-disable require-jsdoc */

jest.autoMockOff();

jest.mock( './lib/spawnProcessAsync.js' );

const glslang = require( './index.js' );
const spawnProcessAsyncMock = require( './lib/spawnProcessAsync.js' );

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

    // white-box testing because the black-box form would be a pedantic and laborious duplication of spawnProcessAsync with little benefit...

    it( 'calls to spawnProcessAsync', () => {
        const options = {quiet: true};
        glslang.standalone.glslangValidatorAsync( options );
        expect( spawnProcessAsyncMock ).toHaveBeenCalledWith( jasmine.stringMatching( /glslangValidator/ ), options );
    });
});


describe( 'node-glslang.standalone.spirvRemapAsync', () => {

    it( 'is a function', () => {
        expect( glslang.standalone.spirvRemapAsync ).toEqual( jasmine.any( Function ) );
    });

    // white-box testing because the black-box form would be a pedantic and laborious duplication of spawnProcessAsync with little benefit...

    it( 'calls to spawnProcessAsync', () => {
        const options = {quiet: true};
        glslang.standalone.spirvRemapAsync( options );
        expect( spawnProcessAsyncMock ).toHaveBeenCalledWith( jasmine.stringMatching( /spirv-remap/ ), options );
    });
});
