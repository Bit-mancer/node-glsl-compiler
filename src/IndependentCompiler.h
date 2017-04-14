#ifndef _NodeGLSLCompiler_src_IndependentCompiler_h_
#define _NodeGLSLCompiler_src_IndependentCompiler_h_

#include <vector>
#include <string>
#include <utility>

#include "Options.h"
#include "WorkItem.h"
#include "WorkList.h"

#include "glslang/StandAlone/ResourceLimits.h"

namespace NodeGLSLCompiler {

    /**
     * Multi-threaded independent shader compiler (that is, each shader is compiled as an independent unit, and no
     * program linking takes place). The advantage of using this compiler is faster compilation time.
     *
     * TODO currently limited to single-threaded operation because glslang hasn't implemented thread-safe comp. on platforms other than Windows...
     *
     * Each IndependentCompiler instance is a one-shot: once any compile*() method has been run, the instance cannot
     * be used to make further compilations. Instead, construct a new instance.
     *
     * THREAD-SAFETY: This class is NOT thread-safe!
     */
    class IndependentCompiler final {
    public:
        /**
         * Initializes a new instance of the Compiler class.
         *
         * @param options Compiler options.
         * @param workItems A set of work items shared_ptrs representing the individual shaders to compile. The
         *                  individual work items will be modified as they are compiled -- work items are NOT
         *                  thread-safe, and should not be accessed while compilation is taking place!
         */
        IndependentCompiler( const Options& options, const std::vector<WorkItemPtr>& workItems );


        IndependentCompiler( const IndependentCompiler& ) = delete;
        IndependentCompiler& operator=( const IndependentCompiler& ) = delete;


        /**
         * Compile the shaders independently, using multithreading.
         *
         * @param outErrorMessage Out-parameter that receives the error message, if an error occurs (see the
         *                        return value).
         * @return true if the work items were fully processed (individual results are noted in each work item;
         *              outErrorMessage will remain unchanged); otherwise, false (outErrorMessage will be set to an
         *              error message string). Note that the return value does NOT indicate the compilation status of
         *              any individual items, but instead whether glslang was able to process all the items.
         */
        bool compile( std::string& outErrorMessage );

    private:
        void compileWorker();

    private:
        const TBuiltInResource _resources;
        const Options _options;
        int _glslangOptions;

        WorkList _workList;
    };

} // namespace

#endif // header guard
