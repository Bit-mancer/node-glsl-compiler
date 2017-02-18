#!/usr/bin/env bash

# bail on errors, treat unset vars as errors, disable filename expansion (globbing), produce an error if any command in a pipeline fails (rather than just the last)
set -euf -o pipefail

TRAVIS_OS_NAME=${TRAVIS_OS_NAME:-} # allow unset (which we'll handle below)

ECHO=$(which echo) || (echo echo not found! && exit 1)


function cmakeInstallMac() {
    if [ "$(which cmake)" == "" ]; then
        brew update
        brew install cmake
    fi
}


function cmakeInstallLinux() {

    # NOTE: Travis apt-get is serving up an old version of cmake, so let's just build it ourselves

    buildDir="$HOME/cmake"

    if [[ ! -d "$buildDir" || ! -d "$buildDir/bin" ]]; then

        MKTEMP=$(which mktemp) || (echo mktemp not found! && exit 1)
        RM=$(which rm) || (echo rm not found! && exit 1)
        WGET=$(which wget) || (echo wget not found! && exit 1)
        MV=$(which mv) || (echo mv not found! && exit 1)
        TAR=$(which tar) || (echo tar not found! && exit 1)
        MAKE=$(which make) || (echo make not found! && exit 1)

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
    fi
}


if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then

    cmakeInstallMac

elif [[ "$TRAVIS_OS_NAME" == "linux" ]]; then

    cmakeInstallLinux
    export CXX=g++-4.8

else
    "$ECHO" "TRAVIS_OS_NAME is $TRAVIS_OS_NAME; skipping cmake..."
fi


which cmake
cmake --version

npm run task ci
