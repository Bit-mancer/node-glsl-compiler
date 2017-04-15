#ifndef _NodeGLSLCompiler_src_Options_h_
#define _NodeGLSLCompiler_src_Options_h_

#include <thread>

namespace NodeGLSLCompiler {

    struct Options {
        static const int kDefaultESShaderVersion = 100;
        static const int kDefaultDesktopShaderVersion = 110;

        const int defaultShaderVersion;
        const int maxWorkerThreads;

        Options( int theDefaultShaderVersion = kDefaultESShaderVersion )
                :   defaultShaderVersion( theDefaultShaderVersion ),
                    maxWorkerThreads(
                        1 // TODO: currently glslang only supports multi-threaded compilation on Windows (see TODO notes in IndependentCompiler)
                        // std::thread::hardware_concurrency() != 0 ? std::thread::hardware_concurrency() : 1
                    ) {
        }
    };

} // namespace

#endif // header guard
