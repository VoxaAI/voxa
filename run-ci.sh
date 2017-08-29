#!/bin/bash
set -ev

yarn run test-ci
yarn run cobertura
yarn run lint

if [ "${CI}" = "true" ]; then
  yarn add coveralls
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
