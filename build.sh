#!/bin/bash

WORKING_DIR=easy-docs/public/build/

if [ -d "$WORKING_DIR" ]; 
then 
    rm -Rf $WORKING_DIR; 
fi
cp -r .build/build/ easy-docs/public/
rm -r .build/