#ifndef _NodeGLSLang_src_CompileStatus_h_
#define _NodeGLSLang_src_CompileStatus_h_

namespace NodeGLSLang {

    enum class CompileStatus {
        Skipped,
        FileNotFound,
        Failure,
        Success
    };

} // namespace

#endif // header guard
