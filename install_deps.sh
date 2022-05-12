#!/bin/bash

# insall weblets dependencies
rm -rf ./node_modules
yarn 

# install playground dependencies
cd /easy-docs
rm -rf ./node_modules
yarn
