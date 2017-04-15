#include "TaskWorker.h"

#include <utility>

#include <nan.h>

namespace NodeGLSLCompiler {

    TaskWorker::TaskWorker( Nan::Callback* callback, std::function<void(Nan::AsyncWorker*)>&& task )
            :   Nan::AsyncWorker( callback ),
                _task( std::move( task ) ) {
    }


    /**
     * Executed inside a libuv worker thread -- you must *NOT* access V8 here!
     */
    void TaskWorker::Execute() {
        if ( _task ) {
            _task( this );
        }
    }


    //static
    void TaskWorker::start( v8::Local<v8::Function> callback, std::function<void(Nan::AsyncWorker*)>&& task ) {
        Nan::HandleScope scope;
        // AsyncQueueWorker takes ownership of allocated memory
        Nan::AsyncQueueWorker( new TaskWorker( new Nan::Callback( callback ), std::move( task ) ) );
    }

} // namespace
