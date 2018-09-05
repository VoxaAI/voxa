#!/bin/bash
set -euo pipefail
set -o xtrace

yarn run test-ci
yarn run report
yarn run lint

npx typedoc --out typedoc --name Voxa --readme ./README.md --target ES5 --ignoreCompilerErrors ./src
NODE_VERSION=${TRAVIS_NODE_VERSION:-}
if [ ! -z ${NODE_VERSION} ];
then
  docker pull "lambci/lambda:nodejs$TRAVIS_NODE_VERSION"
else
  NODE_VERSION=$(node --version | cut -d 'v' -f2 | cut -d'.' -f1,2)
  docker pull "lambci/lambda:nodejs$NODE_VERSION"
fi
(
  cd hello-world
  yarn
  yarn mocha hello-world.spec.js
)

if [ "${CI}" = "true" ]; then
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
