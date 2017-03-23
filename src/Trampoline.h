#ifndef _NodeGLSLang_src_Trampoline_h_
#define _NodeGLSLang_src_Trampoline_h_

#include <functional>

#include <nan.h>

namespace NodeGLSLang {

    /**
     * Bounce a callable to a target libuv event loop.
     *
     * THREAD SAFETY: This class is NOT thread-safe.
     */
    class Trampoline final {
    public:
        /**
         * Initializes a new instance of the Trampoline class, "pinning" the target event loop until bounce() is
         * called (this prevents the target event loop from exiting until bounce() is called). bounce() *must*
         * eventually be called.
         *
         * If capturing in a lambda, you should place instances of Trampoline in a shared_ptr outside of the lambda
         * (thus pinning the event loop), and call bounce() from within the lambda (thus capturing the shared_ptr
         * by value). See the note on class thread safety.
         *
         * @param loop The target libuv event loop.
         */
        explicit Trampoline( uv_loop_t* loop );

        ~Trampoline();

        Trampoline( const Trampoline& ) = delete;
        Trampoline& operator=( const Trampoline& ) = delete;

    public:
        /**
         * Run the provided callable on the target event loop.
         *
         * @param task The callable to run on the event loop provided in the class constructor.
         */
        void bounce( std::function<void()>&& task );

    private:
        uv_async_t* _async;
    };

} // namespace

#endif // header guard
