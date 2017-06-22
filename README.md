Voxa
====================

[![Build Status](https://travis-ci.org/mediarain/voxa.svg?branch=master)](https://travis-ci.org/mediarain/voxa)
[![Coverage Status](https://coveralls.io/repos/github/mediarain/voxa/badge.svg?branch=master)](https://coveralls.io/github/mediarain/voxa?branch=master)
[![Documentation](https://readthedocs.org/projects/voxa/badge/)](http://voxa.readthedocs.io/en/latest/)
[![npm](https://img.shields.io/npm/dm/voxa.svg)](https://www.npmjs.com/package/voxa)
[![Gitter](https://img.shields.io/gitter/room/voxa-rain/voxa.svg)](https://gitter.im/voxa-rain/voxa)

A fsm (state machine) framework for Alexa apps using Node.js

Summary
-------
Voxa is an Alexa skill framework that provides a way to organize a skill into a state machine. Even the most complex voice user interface (VUI) can be represented through the state machine and it provides the flexibility needed to both be rigid when needed in specific states and flexible to jump around when allowing that also makes sense.  

Why Voxa vs other frameworks
----------------------------
Voxa provides a more robust framework for building Alexa skills.  It provides a design pattern that wasn’t found in other frameworks.   Critical to Voxa was providing a pluggable interface and supporting all of the latest ASK features.  

Features
--------

* MVC Pattern
* State or Intent handling (State Machine)
* Easy integration with several Analytics providers
* Easy to modify response file (the view)
* Compatibility with all SSML features
* Works with companion app cards
* Supports i18n in the responses
* Clean code structure with a unit testing framework
* Easy error handling
* Account linking support
* Several Plugins

Installation
-------------

Install from [npm](https://www.npmjs.com/package/voxa)

```bash
npm install --save voxa
```

Usage
------

```javascript
const Voxa = require('voxa');

// Controllers use views to send responses to the user
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
exports.handler = skill.lambda();

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
* [Mail List](https://groups.google.com/d/forum/voxa-framework)
