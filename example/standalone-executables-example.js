'use strict';

const path = require( 'path' );
const glslang = require( '../index.js' );

// use path.join to avoid forward-slash issues on Windows
const kVertSpirv = path.join( '.', 'spirv', 'vert.spv' );
const kFragSpirv = path.join( '.', 'spirv', 'frag.spv' );
const kOptimizedDir = path.join( '.', 'spirv-optimized' );

glslang.glslangValidatorAsync( { args: 'pass.frag' } )
.then( () => {
    return glslang.glslangValidatorAsync( { args: 'fail.frag' } )
    // swallow error because we expect a failure:
    .catch( (err) => {} ); // eslint-disable-line no-unused-vars
}).then( () => {
    return glslang.glslangValidatorAsync( { args: ['-G', '-o', kVertSpirv, 'pass.vert'] });
}).then( () => {
    return glslang.glslangValidatorAsync( { args: ['-G', '-o', kFragSpirv, 'pass.frag'] });
}).then( () => {
    return glslang.spirvRemapAsync( { args: ['-v', '--do-everything', '--input', kVertSpirv, kFragSpirv, '-o', kOptimizedDir] });
});
