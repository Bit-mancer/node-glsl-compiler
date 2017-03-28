#ifndef _NodeGLSLang_src_Options_h_
#define _NodeGLSLang_src_Options_h_

#include <thread>

namespace NodeGLSLang {

    struct Options {
        static const int kDefaultESShaderVersion = 100;
        static const int kDefaultDesktopShaderVersion = 110;

        const int defaultShaderVersion;
        const int numWorkerThreads;

        Options( int theDefaultShaderVersion = kDefaultESShaderVersion )
                :   defaultShaderVersion( theDefaultShaderVersion ),
                    numWorkerThreads( std::thread::hardware_concurrency() != 0 ? std::thread::hardware_concurrency() : 1 ) {
        }
    };

} // namespace

#endif // header guard
