#include "IndependentCompiler.h"

#include <vector>
#include <string>
#include <future>
#include <functional>
#include <sstream>
#include <fstream>
#include <memory>

#include "WorkItem.h"
#include "WorkList.h"
#include "GLSLangUtils.h"

#include "glslang/glslang/Public/ShaderLang.h"
#include "glslang/StandAlone/ResourceLimits.h"

namespace NodeGLSLang {

    /**
     * From glslang StandAlone.cpp -- described as "command-line options", but also passed into Sh* funcs...
     */
    enum class TOptions {
        EOptionNone               = 0,
        EOptionIntermediate       = (1 <<  0),
        EOptionSuppressInfolog    = (1 <<  1),
        EOptionMemoryLeakMode     = (1 <<  2),
        EOptionRelaxedErrors      = (1 <<  3),
        EOptionGiveWarnings       = (1 <<  4),
        EOptionLinkProgram        = (1 <<  5),
        EOptionMultiThreaded      = (1 <<  6),
        EOptionDumpConfig         = (1 <<  7),
        EOptionDumpReflection     = (1 <<  8),
        EOptionSuppressWarnings   = (1 <<  9),
        EOptionDumpVersions       = (1 << 10),
        EOptionSpv                = (1 << 11),
        EOptionHumanReadableSpv   = (1 << 12),
        EOptionVulkanRules        = (1 << 13),
        EOptionDefaultDesktop     = (1 << 14),
        EOptionOutputPreprocessed = (1 << 15),
        EOptionOutputHexadecimal  = (1 << 16),
        EOptionReadHlsl           = (1 << 17),
        EOptionCascadingErrors    = (1 << 18),
    };


    static bool readFile( const std::string& filename, std::unique_ptr<char[]>& outFile, size_t outLength ) {

        std::ifstream file( filename );
        if ( ! file.is_open() ) {
            return false;
        }

        file.seekg( 0, std::ios::end );
        int64_t length = (int64_t) file.tellg(); // std::streampos is signed, and can be -1 to indicate i/o errors
        file.seekg( 0, std::ios::beg );

        if ( length < 0 ) { // unlikely in this usage, but let's be pedantic
            return false;
        }


        outFile.reset( new char[ length + 1 ] );
        outFile[ length ] = '\0';

        file.read( outFile.get(), length );

        outLength = (size_t) length;

        return true;
    }

    /**
     *
     * THREAD-SAFETY: This function is thread-safe.
     */
    static WorkItem::Status compileFile(
            const std::string& filename,
            ShHandle compiler,
            const TBuiltInResource& resources,
            int options,
            int defaultShaderVersion ) {

        std::unique_ptr<char[]> shaderFile;
        size_t length;
        if ( ! readFile( filename, shaderFile, length ) ) {
            return WorkItem::Status::FileNotFound;
        }

        if ( length == 0 ) {
            return WorkItem::Status::Success;
        }

        const char* shaderStrings[ 1 ] = { shaderFile.get() };
        int lengths[ 1 ] = { (int)length };

        EShMessages messages = EShMsgDefault;

        int ret = ShCompile(
            compiler, // compiler
            shaderStrings,
            1, // num strings (ShCompile can handle a shader split across several strings)
            lengths, // input lengths
            EShOptNone, // optimization level
            &resources,
            options,
            defaultShaderVersion,
            false, // forward-compatible (give errors for use of deprecated features)
            messages );

        if ( ret != 0 ) {
            return WorkItem::Status::Success;
        } else {
            return WorkItem::Status::Failure;
        }
    }



    IndependentCompiler::IndependentCompiler( const Options& options, const std::vector<WorkItemPtr>& workItems )
            :   _resources( glslang::DefaultTBuiltInResource ),
                _options( options ),
                _glslangOptions( 0 ),
                _workList( workItems ) {
    }


    bool IndependentCompiler::compile( std::string& outErrorMessage ) {

        if ( _workList.empty() ) {
            return true;
        }


        // Spin off compilation across several threads

        std::vector< std::future<void> > futures;

        auto numThreads = _options.maxWorkerThreads;
        if ( numThreads > _workList.size() ) {
            numThreads = _workList.size();
        }

        if ( numThreads > 1 ) {
            _glslangOptions |= (int)TOptions::EOptionMultiThreaded;
        } else {
            _glslangOptions &= ~(int)TOptions::EOptionMultiThreaded;
        }

        /**
         * TODO once glslang supports multithreaded operations on Mac/Linux, we need to inspect
         * glslang::OS_CreateThread, glslang::OS_WaitForAllThreads, and Sh* funcs to see if we can use STL threading,
         * or if we should switch to the glslang stuff (right now the Sh* functions are NOT thread-safe on other
         * platforms!)
         */

        for ( auto i = 0; i < numThreads; i++ ) {
            std::packaged_task<void()> task( std::bind( &IndependentCompiler::compileWorker, this ) );
            futures.push_back( task.get_future() );
            std::thread( std::move( task ) ).detach();
        }


        // Wait for threads to complete and collate any error messages (these are messages about the compilation
        // process / threading itself, NOT the actual compilation of individual shaders)

        bool compileResult = true;
        std::stringstream errors;

        for ( auto& future : futures ) {
            try {
                future.get();
            } catch( const std::exception& e ) {
                compileResult = false;
                errors << e.what() << std::endl;
            }
        }

        if ( compileResult ) {
            return true;
        } else {
            outErrorMessage = errors.str();
            return false;
        }
    }


    /**
     * Thread proc for compile worker.
     * @throws if an internal error occurs
     */
    void IndependentCompiler::compileWorker() {

        WorkItemPtr work;

        // WorkList is thread-safe for all operations, and our other members (e.g. _options, _resources) are all
        // thread-safe for reads
        while ( _workList.popFront( work ) ) {

            if ( ! work->hasStage ) {
                if ( ! Utils::getStageFromFileExtension( work->filename, work->stage ) ) {
                    work->status = WorkItem::Status::Failure;
                    work->results = "Unable to determine stage (language) for file (the file extension was not recognized and no explicit stage was provided).";
                    continue;
                }

                work->hasStage = true;
            }

            auto compiler = ShConstructCompiler( work->stage, _glslangOptions );
            if ( compiler == nullptr ) {
                throw std::runtime_error( "INTERNAL ERROR -- Failed to construct a compiler (out of memory?)." );
            }

            work->status = compileFile(
                work->filename,
                compiler,
                _resources,
                _glslangOptions,
                _options.defaultShaderVersion );

            work->results = ShGetInfoLog( compiler );

            ShDestruct( compiler );
        }
    }

} // namespace
