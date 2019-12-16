#!/bin/bash
set -euo pipefail
set -o xtrace

yarn run test-ci
yarn run report
yarn run lint
npx nyc check-coverage

npx typedoc --out typedoc --name Voxa --readme ./README.md --target ES2017 --ignoreCompilerErrors ./src

NODE_VERSION=${TRAVIS_NODE_VERSION:-}
if [ -z "${NODE_VERSION}" ]; then
	NODE_VERSION=$(node --version | cut -d 'v' -f2 | cut -d'.' -f1)
fi

if [[ $NODE_VERSION == '10' ]]; then
	LAMBDA_VERSION='10.x'
elif [[ $NODE_VERSION == '12' ]]; then
	LAMBDA_VERSION='12.x'
elif [[ $NODE_VERSION == '8' ]]; then
	LAMBDA_VERSION='8.10'
fi

export NODE_VERSION
export LAMBDA_VERSION

echo "NODE_VERSION: $NODE_VERSION"
echo "LAMBDA_VERSION: $LAMBDA_VERSION"

docker pull "lambci/lambda:nodejs$LAMBDA_VERSION"

(
	cd hello-world
	rm -rf node_modules
	yarn
	yarn mocha hello-world.spec.js
)

if [ "${CI:-}" = "true" ]; then
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
fi
