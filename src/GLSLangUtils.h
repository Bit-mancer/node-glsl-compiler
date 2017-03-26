#ifndef _NodeGLSLang_src_GLSLangUtils_h_
#define _NodeGLSLang_src_GLSLangUtils_h_

#include <string>

#include "glslang/glslang/Public/ShaderLang.h"

namespace NodeGLSLang { namespace Utils {

    /**
     * Gets the stage (formerly "language") of the specified file.
     *
     * @param filePath The filename (which can include the path).
     * @param outStage Receives the stage, if one can be determined.
     * @return true if the stage could be determined (in which case outStage will be set to the stage); otherwise,
     *              false (outStage will remain unchanged).
     */
    bool getStageFromFileExtension( const std::string& filePath, ::EShLanguage& outStage );

}} // namespace

#endif // header guard
