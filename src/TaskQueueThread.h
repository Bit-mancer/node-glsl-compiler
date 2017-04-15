#ifndef _NodeGLSLCompiler_src_TaskQueueThread_h_
#define _NodeGLSLCompiler_src_TaskQueueThread_h_

#include <thread>
#include <future>
#include <mutex>
#include <condition_variable>
#include <list>

namespace NodeGLSLCompiler {

    /**
     * Serial task queue running on an std::thread.
     *
     * The task queue starts in a hibernated state -- tasks can be enqueued via performOnThread(), but the task thread
     * will not begin executing the tasks until start() has been called.
     */
    class TaskQueueThread final {
    public:
        TaskQueueThread();
        ~TaskQueueThread();

    private:
        void threadProc();

    public:
        /**
         * Starts the task queue thread.
         */
        void start();

        /**
         * Enqueues the provided task.
         */
        void performOnThread( std::function<void()>&& task );

        /**
         * Signals the thread backing the task queue to exit. Once signalExit has been called, no further tasks can
         * be enqueued. Existing tasks will continue to execute unless clearTasks is true.
         *
         * It is safe to call this method more than once (a copy of the existing shared_future will be returned).
         *
         * @param clearTasks if true, any existing tasks will be removed from the queue; otherwise, existing tasks
         *                   will continue to be executed until no further tasks remain. finalTask will still be
         *                   run even if clearTasks is set to true.
         * @param finalTask A final task to perform; providing a task in this manner (as opposed to performOnThread)
         *                  guarantees that the provided task is the last task executed by the queue thread.
         * @return A future connected to a promise that is fulfilled once the thread has exited (note that the class
         *         destructor joins the thread, if it is still running, so it's safe to use the future to control
         *         destruction of the TaskQueueThread instance).
         **/
        std::shared_future<void> signalExit( bool clearTasks, std::function<void()>&& finalTask );

        /**
         * Signals the thread backing the task queue to exit. Once signalExit has been called, no further tasks can
         * be enqueued. Existing tasks will continue to execute unless clearTasks is true.
         *
         * clearTasks() can be called to remove existing tasks prior to calling signalExit(), but it is possible for
         * another thread to preempt and enqueue further tasks before the call to signalExit() is able to obtain the
         * mutex. Alternatively, you can call clearTasksAndSignalExit().
         *
         * It is safe to call this method more than once (a copy of the existing shared_future will be returned).
         *
         * @param clearTasks if true, any existing tasks will be removed from the queue; otherwise, existing tasks
         *                   will continue to be executed until no further tasks remain.
         * @return A future connected to a promise that is fulfilled once the thread has exited (note that the class
         *         destructor joins the thread, if it is still running, so it's safe to use the future to control
         *         destruction of the TaskQueueThread instance).
         **/
        std::shared_future<void> signalExit( bool clearTasks );

    private:
        std::thread _thread;
        std::mutex _mutex;
        std::condition_variable _condition;

        // protected by _mutex:
        bool _doExit;
        std::promise<void> _exitPromise;
        std::shared_future<void> _exitFuture;
        std::list< std::function<void()> > _tasks;
    };

} // namespace

#endif // header guard
