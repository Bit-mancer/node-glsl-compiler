'use strict';

/* eslint-disable no-console */

jest.autoMockOff();

const assert = require( 'assert' );
const Promise = require( 'bluebird' );
const ProcessError = require( '../lib/ProcessError.js' );
const glslang = require( '../index.js' );

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

    beforeEach( () => {
        jest.spyOn( console, 'log' ).mockImplementation( () => {} );
        jest.spyOn( console, 'error' ).mockImplementation( () => {} );
    } );

    it( 'is a function', () => {
        expect( glslang.standalone.glslangValidatorAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an options hash as the first argument', () => {
        glslang.standalone.glslangValidatorAsync()
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });

        glslang.standalone.glslangValidatorAsync( {} )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });
    });

    it( 'requires an options hash with an "args" key and string or array-of-strings value', () => {
        glslang.standalone.glslangValidatorAsync( { args: 42 } )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });

        glslang.standalone.glslangValidatorAsync( { args: [42] } )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });

        glslang.standalone.glslangValidatorAsync( { args: '-?' } );
        glslang.standalone.glslangValidatorAsync( { args: ['-?'] } );
    });

    it( 'requires an options hash with an optional "stdout" key and function value', () => {
        glslang.standalone.glslangValidatorAsync( {
            args: '-?',
            stdout: buffer => {
                expect( buffer ).toEqual( jasmine.any( Buffer ) );
                console.log( buffer.toString() );
            }
        }).then( () => {
            expect( console.log ).toHaveBeenCalled();
        });
    });

    it( 'requires an options hash with an optional "stderr" key and function value', () => {
        glslang.standalone.glslangValidatorAsync( {
            args: '-?',
            stderr: buffer => {
                expect( buffer ).toEqual( jasmine.any( Buffer ) );
                console.error( buffer.toString() );
            }
        }).then( () => {
            expect( console.error ).toHaveBeenCalled();
        });
    });

    it( 'returns a Bluebird Promise', () => {
        const promise = glslang.standalone.glslangValidatorAsync( { args: '-?' } );
        expect( promise instanceof Promise ).toBeTruthy();
    });

    it( 'rejects the Promise it returns with a ProcessError if the executable has a non-zero exit code', () => {
        glslang.standalone.glslangValidatorAsync( { args: '--a-non-existent-command-line-switch' } )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( ProcessError ) );
        });
    });
});


describe( 'node-glslang.standalone.spirvRemapAsync', () => {

    beforeEach( () => {
        jest.spyOn( console, 'log' ).mockImplementation( () => {} );
        jest.spyOn( console, 'error' ).mockImplementation( () => {} );
    } );

    it( 'is a function', () => {
        expect( glslang.standalone.spirvRemapAsync ).toEqual( jasmine.any( Function ) );
    });

    it( 'requires an options hash as the first argument', () => {
        glslang.standalone.spirvRemapAsync()
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });

        glslang.standalone.spirvRemapAsync( {} )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });
    });

    it( 'requires an options hash with an "args" key and string or array-of-strings value', () => {
        glslang.standalone.spirvRemapAsync( { args: 42 } )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });

        glslang.standalone.spirvRemapAsync( { args: [42] } )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( assert.AssertionError ) );
        });

        glslang.standalone.spirvRemapAsync( { args: '-?' } );
        glslang.standalone.spirvRemapAsync( { args: ['-?'] } );
    });

    it( 'requires an options hash with an optional "stdout" key and function value', () => {
        glslang.standalone.spirvRemapAsync( {
            args: '-?',
            stdout: buffer => {
                expect( buffer ).toEqual( jasmine.any( Buffer ) );
                console.log( buffer.toString() );
            }
        }).then( () => {
            expect( console.log ).toHaveBeenCalled();
        });
    });

    it( 'requires an options hash with an optional "stderr" key and function value', () => {
        glslang.standalone.spirvRemapAsync( {
            args: '-?',
            stderr: buffer => {
                expect( buffer ).toEqual( jasmine.any( Buffer ) );
                console.error( buffer.toString() );
            }
        }).then( () => {
            expect( console.error ).toHaveBeenCalled();
        });
    });

    it( 'returns a Bluebird Promise', () => {
        const promise = glslang.standalone.spirvRemapAsync( { args: '-?' } );
        expect( promise instanceof Promise ).toBeTruthy();
    });

    it( 'rejects the Promise it returns with a ProcessError if the executable has a non-zero exit code', () => {
        glslang.standalone.spirvRemapAsync( { args: '--a-non-existent-command-line-switch' } )
        .catch( err => {
            expect( err ).toEqual( jasmine.any( ProcessError ) );
        });
    });
});
