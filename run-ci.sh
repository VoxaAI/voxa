#!/bin/bash
set -ev

yarn run test-ci
yarn run cobertura
yarn run lint
yarn link

PROJECT_DIRECTORY=$(pwd)

for SAMPLE_DIRECTORY in `find ./samples -maxdepth 1 -mindepth 1 -type d` ; do
  cd "$PROJECT_DIRECTORY/$SAMPLE_DIRECTORY"
  for file in config/*.json; do
    python2 -m json.tool $file
  done
  yarn link voxa
  yarn 
  cp config/local.json.example config/local.json
  yarn run lint
  yarn run test
done

cd $PROJECT_DIRECTORY

if [ "${CI}" = "true" ]; then
  yarn add coveralls
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
