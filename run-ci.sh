#!/bin/bash
set -ev

yarn run test-ci
yarn run cobertura
yarn run lint
yarn link

PROJECT_DIRECTORY=$(pwd)

cd $PROJECT_DIRECTORY

if [ "${CI}" = "true" ]; then
  yarn add coveralls --ignore-engines
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
