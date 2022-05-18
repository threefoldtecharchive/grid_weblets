#!/bin/bash

WORKING_DIR=./playground/public/build/
pwd
if [ -d "$WORKING_DIR" ]; 
then 
    rm -Rf $WORKING_DIR; 
fi
cp -r .build/build/ playground/public/
rm -r .build/