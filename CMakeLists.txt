cmake_minimum_required(VERSION 2.8.11) # shadow glslang/CMakeLists.txt

project(node_glslang)

# Defined AFTER project (see http://public.kitware.com/pipermail/cmake/2010-December/041135.html)
SET(CMAKE_BUILD_TYPE Release CACHE PATH "build type" FORCE)

include(NodeJS.cmake)
nodejs_init()


include_directories( "./" "./glslang" )

file(GLOB node_glslang_src
    "src/*.cpp"
    "src/*.h"
)

add_nodejs_module( ${PROJECT_NAME} ${node_glslang_src})


set(LIBRARIES
    glslang
    OGLCompiler
    OSDependent
)

if(WIN32)
    set(LIBRARIES ${LIBRARIES} psapi)
elseif(UNIX)
    if(NOT ANDROID)
        set(LIBRARIES ${LIBRARIES} pthread)
    endif()
endif(WIN32)

target_link_libraries(${PROJECT_NAME} ${LIBRARIES})



# Build glslang itself (libs+standalones)
add_subdirectory(glslang)
