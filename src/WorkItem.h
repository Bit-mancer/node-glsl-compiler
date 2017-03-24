#ifndef _NodeGLSLang_src_WorkItem_h_
#define _NodeGLSLang_src_WorkItem_h_

#include <string>
#include <memory>

#include "glslang/glslang/Public/ShaderLang.h"

namespace NodeGLSLang {

    /**
     * We want to handle the stage differently, and the StandAlone TWorkItem has a non-virtual dtor, so let's just
     * roll our own...
     */

    struct WorkItem final {
        const std::string fileName;
        const EShLanguage stage;
        std::string results;

        WorkItem( const std::string& theFileName, const EShLanguage& theStage )
                :   fileName( theFileName ),
                    stage( theStage ) {
        }
    };


    typedef std::shared_ptr<WorkItem> WorkItemPtr;

} // namespace

#endif // header guard
