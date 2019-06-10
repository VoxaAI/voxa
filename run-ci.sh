#!/bin/bash
set -euo pipefail
set -o xtrace

yarn run test-ci
yarn run report
yarn run lint
npx nyc check-coverage

npx typedoc --out typedoc --name Voxa --readme ./README.md --target ES2017 --ignoreCompilerErrors ./src
export NODE_VERSION=${TRAVIS_NODE_VERSION:-}
if [ -z "${NODE_VERSION}" ]; then
  export NODE_VERSION=$(node --version | cut -d 'v' -f2 | cut -d'.' -f1,2)
fi

docker pull "lambci/lambda:nodejs$NODE_VERSION"

(
  cd hello-world
  rm -rf node_modules
  yarn
  yarn mocha hello-world.spec.js
)

if [ "${CI:-}" = "true" ]; then
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
