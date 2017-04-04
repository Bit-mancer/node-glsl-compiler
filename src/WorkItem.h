#ifndef _NodeGLSLang_src_WorkItem_h_
#define _NodeGLSLang_src_WorkItem_h_

#include <string>
#include <memory>

#include "glslang/glslang/Public/ShaderLang.h"

#include "CompileStatus.h"

namespace NodeGLSLang {

    /**
     * We want to handle the stage differently, and the StandAlone TWorkItem has a non-virtual dtor, so let's just
     * roll our own...
     */

    struct WorkItem final {

        const std::string filename;

        bool hasStage;
        EShLanguage stage;

        CompileStatus status = CompileStatus::Skipped;
        std::string results;


        WorkItem( const std::string& theFilename )
                :   filename( theFilename ),
                    hasStage( false ) {
        }

        WorkItem( const std::string& theFilename, const EShLanguage& theStage )
                :   filename( theFilename ),
                    hasStage( true ),
                    stage( theStage ) {
        }
    };


    typedef std::shared_ptr<WorkItem> WorkItemPtr;

} // namespace

#endif // header guard
