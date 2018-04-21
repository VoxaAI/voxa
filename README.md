Voxa
====================
Voxa is an framework that provides a way to organize a conversational experience into a state machine. Even the most complex voice user interface (VUI) can be represented through the state machine and it provides the flexibility needed to both be rigid when needed in specific states and flexible to jump around states when needed.  

Why Voxa vs other frameworks
----------------------------
Voxa provides a more robust framework for building Alexa skills.  It provides a design pattern that wasn’t found in other frameworks.   Critical to Voxa was providing a pluggable interface and supporting all of the latest ASK features.  

Platform Support
-------------

![Alexa](/assets/img/alexa.png) ![Assistant](/assets/img/assistant.png) ![Cortana](/assets/img/cortana.png)


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

[![Build Status](https://travis-ci.org/mediarain/voxa.svg?branch=master)](https://travis-ci.org/mediarain/voxa)
[![Coverage Status](https://coveralls.io/repos/github/mediarain/voxa/badge.svg?branch=master)](https://coveralls.io/github/mediarain/voxa?branch=master)
[![Documentation](https://readthedocs.org/projects/voxa/badge/)](http://voxa.readthedocs.io/en/latest/)
[![npm](https://img.shields.io/npm/dm/voxa.svg)](https://www.npmjs.com/package/voxa)


JS Code linting
-----------------

```bash
npm run lint
```

Resources
----------

* [Documentation](http://voxa.readthedocs.io/en/latest/)
* [Bug Tracker](https://github.com/mediarain/voxa/issues)
* [Mail List](https://groups.google.com/d/forum/voxa-framework) (https://groups.google.com/d/forum/voxa-framework)
* [IRC](irc://chat.freenode.net/voxa) (chat.freenode.net, #voxa)
