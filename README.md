Voxa
====================

[![Build Status](https://travis-ci.org/VoxaAI/voxa.svg?branch=master)](https://travis-ci.org/VoxaAI/voxa)
[![Coverage Status](https://coveralls.io/repos/github/VoxaAI/voxa/badge.svg?branch=master)](https://coveralls.io/github/VoxaAI/voxa?branch=master)
[![Documentation](https://readthedocs.org/projects/voxa/badge/)](http://voxa.readthedocs.io/en/latest/)
[![npm](https://img.shields.io/npm/dm/voxa.svg)](https://www.npmjs.com/package/voxa)
[![Gitter](https://img.shields.io/gitter/room/voxa-rain/voxa.svg)](https://gitter.im/voxa-rain/voxa)

A fsm (state machine) framework for Alexa skills, Google actions, Facebook Messenger and Telegram bots using Node.js

Summary
-------
Voxa is a Node.js MVC framework that provides a way to organize a voice application into a state machine. Even the most complex voice user interface (VUI) can be represented through the state machine and it provides the flexibility needed to both be rigid when needed in specific states and flexible to jump around when allowing that also makes sense.

Why Voxa vs other frameworks
----------------------------
Voxa provides a more robust framework for building Alexa skills, Google Actions, and Facebook Messenger and Telegram Bots. It provides a design pattern that is not found in other frameworks. Critical to Voxa is to provide a pluggable interface and support to all of the latest features from the official frameworks of each voice platform, like ASK and actions-on-google.

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
const {
  AlexaPlatform,
  GoogleAssistantPlatform,
  FacebookPlatform,
  VoxaApp,
} = require('voxa');

// Controllers use views to send responses to the user
const views = {
  en: {
    translation: {
      LaunchIntent: {
        tell: 'Hello World!',
      },
    },
  },
};

const facebookAppParams = {
  pageAccessToken: 'pageAccessToken',
};

// initialize the voice apps
const voxaApp = new VoxaApp({ views });
const alexa = new AlexaPlatform(voxaApp);
const google = new GoogleAssistantPlatform(voxaApp);
const facebook = new FacebookPlatform(voxaApp, facebookAppParams);

// respond to a LaunchIntent
voxaApp.onIntent('LaunchIntent', (event) => {
  return { reply: 'LaunchIntent' };
});

// lambda handlers
exports.alexaHandler = alexa.lambda();
exports.googleHandler = google.lambda();
exports.facebookHandler = facebook.lambda();
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

