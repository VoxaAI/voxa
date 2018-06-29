#!/bin/bash
set -ev

yarn run test-ci
yarn run report
yarn run lint

npx typedoc --out typedoc --name Voxa --readme ./README.md --target ES5 ./src

if [ "${CI}" = "true" ]; then
  (
  cd hello-world
  yarn
  yarn mocha hello-world.spec.js
  )

  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
