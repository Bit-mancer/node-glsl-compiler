cmake_minimum_required(VERSION 3.1)

project(node-glslang)

# Defined AFTER project (see http://public.kitware.com/pipermail/cmake/2010-December/041135.html)
SET(CMAKE_BUILD_TYPE Release CACHE PATH "build type" FORCE)

add_subdirectory(glslang)
