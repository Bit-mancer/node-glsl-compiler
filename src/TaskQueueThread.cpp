#include "TaskQueueThread.h"

#include <thread>
#include <future>
#include <mutex>
#include <condition_variable>
#include <list>
#include <sstream>
#include <iostream>
#include <utility>

namespace NodeGLSLCompiler {

    typedef std::lock_guard<std::mutex> Guard;


    /**
     * TaskQueueThread member methods are UNSAFE to call from other member methods *while* holding the lock!
     */


    TaskQueueThread::TaskQueueThread() : _doExit( false ) {
    }


    TaskQueueThread::~TaskQueueThread() {

        if ( _thread.joinable() ) {

            bool needsSignal = false;

            {
                Guard lock( _mutex );
                needsSignal = ! _doExit;
            }

            if ( needsSignal ) {
                std::stringstream ss;
                ss << "WARNING: ~TaskQueueThread: thread exit wasn't signaled!  (>>> Please Report This Message <<<)" << std::endl;
                std::cerr << ss.str();

                signalExit( true );
            }

            _thread.join();
        }
    }


    void TaskQueueThread::threadProc() {

        // written to handle the case of signalExit() before we are able to spin up:

        std::unique_lock<std::mutex> lock( _mutex );

        do {

            if ( ! _doExit && _tasks.empty() ) {
                _condition.wait( lock );
                // condition has been signaled and we now hold the lock again
            }

            while ( ! _tasks.empty() ) {
                auto task( _tasks.front() );
                _tasks.pop_front();

                lock.unlock();
                task();
                lock.lock();
            }

        } while ( ! _doExit );

        _exitPromise.set_value();

        lock.unlock();
    }


    void TaskQueueThread::start() {
        Guard lock( _mutex );
        if ( ! _thread.joinable() ) {
            _doExit = false;
            _thread = std::move( std::thread( &TaskQueueThread::threadProc, this ) ); // safe to pass 'this' because our dtor ensures thread shutdown
        }
    }


    void TaskQueueThread::performOnThread( std::function<void()>&& task ) {
        Guard lock( _mutex );
        if ( ! _doExit ) {
            _tasks.push_back( std::move( task ) );
            _condition.notify_all();
        }
    }


    std::shared_future<void> TaskQueueThread::signalExit( bool clearTasks, std::function<void()>&& finalTask ) {

        Guard lock( _mutex );

        if ( ! _doExit ) {
            _exitPromise = std::promise<void>();
            _exitFuture = _exitPromise.get_future();

            _doExit = true;

            if ( clearTasks ) {
                _tasks.clear();
            }

            if ( finalTask ) {
                _tasks.push_back( std::move( finalTask ) );
            }

            _condition.notify_all();
        }

        return _exitFuture;
    }


    std::shared_future<void> TaskQueueThread::signalExit( bool clearTasks ) {
        return signalExit( clearTasks, std::move( std::function<void()>() ) );
    }

} // namespace
