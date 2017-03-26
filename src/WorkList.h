#ifndef _NodeGLSLang_src_WorkList_h_
#define _NodeGLSLang_src_WorkList_h_

#include <list>

#include "WorkItem.h"

namespace NodeGLSLang {

    /**
     * We want to handle the stage differently, and the StandAlone TWorkItem has a non-virtual dtor, so let's just
     * roll our own...
     */

    // TODO this class is to be used once glslang supports multithreaded compilation on all platforms...

    class WorkList final {
    public:
        WorkList();
        explicit WorkList( std::list<WorkItemPtr>&& work );

        void pushBack( const WorkItemPtr& item );
        bool popFront( WorkItemPtr& outItem );

        size_t size() const;
        bool empty() const;

    private:
        std::list<WorkItemPtr> _work;
    };

} // namespace

#endif // header guard
