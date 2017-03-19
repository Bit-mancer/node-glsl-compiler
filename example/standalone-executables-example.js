'use strict';

const assert = require( 'assert' );
const path = require( 'path' );
const glslang = require( '../index.js' );


// use path.join to avoid forward-slash issues on Windows
const kVertSpirv = path.join( '.', 'spirv', 'vert.spv' );
const kFragSpirv = path.join( '.', 'spirv', 'frag.spv' );
const kOptimizedDir = path.join( '.', 'spirv-optimized' );


console.log( 'The raw output from glslangValidator and spirv-remap follow (you\'ll see an intentional error from fail.frag): ' );
console.log( '(check the spirv and spirv-optimized folders for output)' );
console.log();

glslang.standalone.glslangValidatorAsync( { args: 'pass.frag' }, err => {
    assert( ! err );
});

glslang.standalone.glslangValidatorAsync( { args: 'fail.frag' }, err => {
    assert( err, 'expect an error' );
});

glslang.standalone.glslangValidatorAsync( { args: ['-G', '-o', kVertSpirv, 'pass.vert'] }, err => {
    assert( ! err );

    glslang.standalone.glslangValidatorAsync( { args: ['-G', '-o', kFragSpirv, 'pass.frag'] }, err => {
        assert( ! err );

        glslang.standalone.spirvRemapAsync( { args: ['--do-everything', '--input', kVertSpirv, kFragSpirv, '-o', kOptimizedDir] }, err => {
            assert( ! err );
        });
    });
});
