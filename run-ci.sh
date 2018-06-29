#!/bin/bash
set -ev

yarn run test-ci
yarn run report
yarn run lint

npx typedoc --out typedoc --name Voxa --readme ./README.md --target ES5 ./src

docker pull "lambci/lambda:nodejs$TRAVIS_NODE_VERSION"
(
  cd hello-world
  yarn
  yarn mocha hello-world.spec.js
)

if [ "${CI}" = "true" ]; then
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
