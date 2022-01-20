#!/bin/bash

set -e
set -u

mode=$1
if [ $mode != "module" ] && [ $mode != "main" ]
then
    echo "need to specify 'module' or 'main' as the first argument"
    exit 1
fi

# Copying over the Javascript files.
destdir=$mode
cp js/*.js $destdir
rm $destdir/for_node.js

# Building the Wasm files.
builddir=build_$mode
if [ $mode == "main" ]
then
    node_flag=ON
else
    node_flag=OFF
fi

if [ ! -e $builddir ]
then
    emcmake cmake -S . -B $builddir -DCOMPILE_NODE=${node_flag}
fi

cd $builddir
emmake make

final=../${destdir}/wasm
mkdir -p ${final}
cp -r scran.* ${final}

if [ $mode == "main" ]
then
    # For easier testing.
    mkdir -p ../js/wasm
    cp -r scran.* ../js/wasm
fi