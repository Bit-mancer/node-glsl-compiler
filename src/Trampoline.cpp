#include "Trampoline.h"

#include <cassert>
#include <functional>
#include <utility>

#include <nan.h>

namespace NodeGLSLang {

    static void trampolineAfterClose( uv_handle_t* handle ) {
        delete reinterpret_cast<uv_async_t*>( handle );
    }


    static void trampolineCallback( uv_async_t* async ) {

        auto task = static_cast< std::function<void()>* >( async->data );
        async->data = nullptr;

        if ( *task ) {
            (*task)();
        }

        delete task;

        uv_close( reinterpret_cast<uv_handle_t*>( async ), trampolineAfterClose );
    }


    Trampoline::Trampoline( uv_loop_t* loop ) : _async( new uv_async_t ) {
        uv_async_init( loop, _async, trampolineCallback );
    }


    Trampoline::~Trampoline() {
        assert( _async == nullptr );
    }


    void Trampoline::bounce( std::function<void()>&& task ) {

        assert( _async );

        _async->data = new std::function<void()>( std::move( task ) );

        auto async = _async;
        _async = nullptr;
        uv_async_send( async );
    }

} // namespace
