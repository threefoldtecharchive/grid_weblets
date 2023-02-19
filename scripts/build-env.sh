#!/bin/sh

if [ -d dist ] 
then
    file="dist/config.js"
else
    file="config.js"
fi

if [ -z ${NETWORK+x} ]
then
    echo 'Error! $NETWORK is required.'
    exit 1
fi

configs="
window.env = {
  network: '$NETWORK',
};
"

if [ -e $file ]
then
    rm $file
fi

echo $configs > $file