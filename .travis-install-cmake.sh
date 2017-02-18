#!/usr/bin/env bash

# bail on errors, treat unset vars as errors, disable filename expansion (globbing), produce an error if any command in a pipeline fails (rather than just the last)
set -euf -o pipefail

ECHO=$(which echo) || (echo echo not found! && exit 1)

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then

    if [ "$(which cmake)" == "" ]; then
        brew update
        brew install cmake
    fi

elif [[ "$TRAVIS_OS_NAME" == "linux" ]]; then

    : ${1:?}
    buildDir="$1"

    MKTEMP=$(which mktemp) || (echo mktemp not found! && exit 1)
    RM=$(which rm) || (echo rm not found! && exit 1)
    WGET=$(which wget) || (echo wget not found! && exit 1)
    MV=$(which mv) || (echo mv not found! && exit 1)
    TAR=$(which tar) || (echo tar not found! && exit 1)
    MAKE=$(which make) || (echo make not found! && exit 1)

    if [[ ! -d "$buildDir" || ! -d "$buildDir/bin" ]]; then
        tempDir=$("$MKTEMP" -d)
        function cleanup {
            $RM -rf "$tempDir"
        }
        trap cleanup EXIT

        "$WGET" -P "$tempDir" https://cmake.org/files/v3.7/cmake-3.7.2.tar.gz
        (cd "$tempDir" && "$TAR" -xzf cmake-3.7.2.tar.gz)
        (cd "$tempDir/cmake-3.7.2" && ./bootstrap --prefix="$buildDir" && "$MAKE" && "$MAKE" install)
    else
        "$ECHO" cmake appears to already exist at $buildDir
        "$buildDir/bin/cmake" --version
    fi

else

    "$ECHO" TRAVIS_OS_NAME is $TRAVIS_OS_NAME; skipping cmake...

fi
