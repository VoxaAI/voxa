#!/bin/bash
set -ev

npm run test-ci
npm run cobertura
npm run lint

npm install coveralls

if [ "${CI}" = "true" ]; then
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
