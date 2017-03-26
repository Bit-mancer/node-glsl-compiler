#include <memory>
#include <sstream>

#include <nan.h>

#include "NanUtils.h"
#include "GLSLangUtils.h"
#include "TaskWorker.h"
#include "TaskQueueThread.h"
#include "Trampoline.h"
#include "WorkItem.h"
#include "WorkList.h"

namespace NodeGLSLang {

    static TaskQueueThread g_taskQueue;
    static WorkList g_workList;


    // Exported, but not intended for use outside the node-glslang module
    NAN_METHOD( private_finalizeProcess ) {

        if ( info.Length() != 1 ) {
            Nan::ThrowTypeError( "Exected one argument" );
            return;
        }

        if ( ! info[ 0 ]->IsFunction() ) {
            Nan::ThrowTypeError( "Expected first argument to be a callback function" );
            return;
        }


        // Cancel work and run finalization on the glslang thread
        auto future = g_taskQueue.signalExit(
            true, // remove existing tasks
            [] { glslang::FinalizeProcess(); } );

        // Spin off a sync wait on the future, and trigger (on the v8 thread) the callback we were provided when the
        // promise connected to the future is fulfilled
        TaskWorker::start( info[ 0 ].As<v8::Function>(), [future]( Nan::AsyncWorker* worker ) {
            assert( future.valid() );
            future.wait();
        });
    }


    NAN_MODULE_INIT( initializeModule ) {

        auto stages = Nan::New<v8::Object>();

        _NAN_EXPORT_NUMBER( stages, "VERTEX", (int) EShLanguage::EShLangVertex );
        _NAN_EXPORT_NUMBER( stages, "TESSELLATION_CONTROL", (int) EShLanguage::EShLangTessControl );
        _NAN_EXPORT_NUMBER( stages, "TESSELLATION_EVALUATION", (int) EShLanguage::EShLangTessEvaluation );
        _NAN_EXPORT_NUMBER( stages, "GEOMETRY", (int) EShLanguage::EShLangGeometry );
        _NAN_EXPORT_NUMBER( stages, "FRAGMENT", (int) EShLanguage::EShLangFragment );
        _NAN_EXPORT_NUMBER( stages, "COMPUTE", (int) EShLanguage::EShLangCompute );

        Nan::Set( target, _V8S("STAGE"), stages );


        NAN_EXPORT( target, private_finalizeProcess );


        g_taskQueue.start();
        g_taskQueue.performOnThread( [] {
            // call exactly once per process (the corresponding FinalizeProcess is exposed via
            // private_finalizeProcess, and is expected to be called on node process termination)
            glslang::InitializeProcess();
        });
    }


    NODE_MODULE( MODULE_NAME, initializeModule );
}
