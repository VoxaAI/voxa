#!/bin/bash
set -ev

npm run test-ci
npm run cobertura
npm run lint
npm link

PROJECT_DIRECTORY=$(pwd)

for SAMPLE_DIRECTORY in `find ./samples -maxdepth 1 -mindepth 1 -type d` ; do
  cd "$PROJECT_DIRECTORY/$SAMPLE_DIRECTORY"
  for file in config/*.json; do
    python2 -m json.tool $file
  done
  npm link voxa
  npm install 
  cp config/local.json.example config/local.json
  npm run lint
  npm run test
done

if [ "${CI}" = "true" ]; then
  npm install coveralls
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
