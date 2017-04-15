#ifndef _NodeGLSLCompiler_src_TaskWorker_h_
#define _NodeGLSLCompiler_src_TaskWorker_h_

#include <functional>

#include <nan.h>

namespace NodeGLSLCompiler {

    /**
     * Represents a callable-based (task) libuv async worker.
     */
    class TaskWorker : public Nan::AsyncWorker {
    public:
        /**
         * Initializes a new instance of the TaskWorker class.
         * @param callback The callback to execute upon completion of the async worker task.
         * @param task The callable task. The TaskWorker instance running the task is passed as the first parameter
         *             (which allows you to set an error message, for example). The task is run inside a libuv thread,
         *             so you must not access V8 from the task.
         */
        TaskWorker( Nan::Callback* callback, std::function<void(Nan::AsyncWorker*)>&& task );

        virtual void Execute() override;

        /**
         * Static helper to spin off a task.
         * @param callback The callback to execute upon completion of the async worker task.
         * @param task The callable task. The TaskWorker instance running the task is passed as the first parameter
         *             (which allows you to set an error message, for example). The task is run inside a libuv thread,
         *             so you must not access V8 from the task.
         */
        static void start( v8::Local<v8::Function> callback, std::function<void(Nan::AsyncWorker*)>&& task );

    private:
        std::function<void(Nan::AsyncWorker*)> _task;
    };

} // namespace

#endif // header guard
