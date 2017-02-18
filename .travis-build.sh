#!/usr/bin/env bash

# bail on errors, treat unset vars as errors, disable filename expansion (globbing), produce an error if any command in a pipeline fails (rather than just the last)
set -euf -o pipefail

TRAVIS_OS_NAME=${TRAVIS_OS_NAME:-} # allow unset (which we'll handle below)

ECHO=$(which echo) || (echo echo not found! && exit 1)

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then

    if [ "$(which cmake)" == "" ]; then
        brew update
        brew install cmake
    fi

elif [[ "$TRAVIS_OS_NAME" == "linux" ]]; then

    sudo apt-get -qq update
    sudo apt-get -q install cmake

    export CXX=g++-4.8

else
    "$ECHO" "TRAVIS_OS_NAME is $TRAVIS_OS_NAME; skipping cmake..."
fi


npm run task ci
