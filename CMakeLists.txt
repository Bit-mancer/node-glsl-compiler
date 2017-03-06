cmake_minimum_required(VERSION 2.8.11) # shadow glslang/CMakeLists.txt

project(node_glslang)

# Defined AFTER project (see http://public.kitware.com/pipermail/cmake/2010-December/041135.html)
SET(CMAKE_BUILD_TYPE Release CACHE PATH "build type" FORCE)

add_subdirectory(glslang)
