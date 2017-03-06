Voxa
====================

[![Build Status](https://travis-ci.org/mediarain/voxa.svg?branch=master)](https://travis-ci.org/mediarain/voxa)
[![Coverage Status](https://coveralls.io/repos/github/mediarain/voxa/badge.svg?branch=master)](https://coveralls.io/github/mediarain/voxa?branch=master)

A fsm (state machine) framework for Alexa apps using Node.js

Installation
-------------

Just install from [npm](https://www.npmjs.com/package/voxa)

```bash
npm install --save voxa
```

Usage
------

```javascript
const Voxa = require('voxa');

// Views are used by your controller to send responses to the user
const views = {
  LaunchIntent: { tell: 'Hello World!' },
}

// initialize the skill
const skill = new Voxa({ views })

// respond to a LaunchIntent
skill.onIntent('LaunchIntent', (event) => {
  return { reply: 'LaunchIntent' };
});

// lambda handler
exports.handler = function handler(event, context, callback) {
  return skill.execute(event, context)
    .then(result => callback(null, result))
    .catch(callback);
}

```

Tests
------

An extensive test suite with more than 90% code coverage

```bash
npm run test
```

JS Code linting
-----------------

```bash
npm run lint
```

Resources
----------

* [Documentation](http://voxa.readthedocs.io/en/latest/)
* [Bug Tracker](https://github.com/mediarain/voxa/issues)
* [Mail List](https://groups.google.com/d/forum/voxa) (https://groups.google.com/d/forum/voxa)
* [IRC](irc://chat.freenode.net/voxa) (chat.freenode.net, #voxa)
