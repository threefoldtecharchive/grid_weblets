#!/bin/bash

WORKING_DIR=./playground/public/build/
pwd
if [ -z "$TARGET_WEBLETS" ]; then
    if [ -d "$WORKING_DIR" ]; then
        rm -Rf $WORKING_DIR
    fi
fi
cp -r .build/build/ playground/public/
rm -r .build/
