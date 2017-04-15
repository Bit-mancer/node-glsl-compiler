#include "GLSLangUtils.h"

#include <string>

#include "glslang/glslang/Public/ShaderLang.h"


namespace NodeGLSLCompiler { namespace Utils {

    bool getStageFromFileExtension( const std::string& filePath, EShLanguage& outStage ) {

        auto dot = filePath.rfind( '.' );
        if ( dot == std::string::npos ) {
            return false;
        }

        auto ext = filePath.substr( dot + 1, std::string::npos );

        if ( ext == "vert" ) {
            outStage = EShLangVertex;
        } else if ( ext == "tesc" ) {
            outStage = EShLangTessControl;
        } else if ( ext == "tese" ) {
            outStage = EShLangTessEvaluation;
        } else if ( ext == "geom" ) {
            outStage = EShLangGeometry;
        } else if ( ext == "frag" ) {
            outStage = EShLangFragment;
        } else if ( ext == "comp" ) {
            outStage = EShLangCompute;
        } else {
            return false;
        }

        return true;
    }

}} // namespace
