#!/bin/bash
set -ev

yarn run test-ci
yarn run cobertura
yarn run lint

if [ "${CI}" = "true" ]; then
  yarn add coveralls --ignore-engines
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
