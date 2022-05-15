#!/bin/bash

# insall weblets dependencies
rm -rf ./node_modules
yarn 

# install playground dependencies
cd ./playground
rm -rf ./node_modules
yarn
