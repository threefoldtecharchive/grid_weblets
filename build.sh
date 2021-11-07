#!/bin/sh
mv docs/index.html index.html

rm -r docs
yarn build:docs:file

cp index.html docs/index.html
cp public/global.css docs/global.css
cp -r markdown docs