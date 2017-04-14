#ifndef _NodeGLSLCompiler_src_CompileStatus_h_
#define _NodeGLSLCompiler_src_CompileStatus_h_

namespace NodeGLSLCompiler {

    enum class CompileStatus {
        Skipped,
        FileNotFound,
        Failure,
        Success
    };

} // namespace

#endif // header guard
