Alexa State Machine
====================

A fsm (state machine) framework for Alexa apps using Node.js

Installation
-------------

Just install from [npm](https://www.npmjs.com/package/alexa-statemachine)

```bash
npm install --save alexa-statemachine
```

Usage
------

```javascript
const _ = require('lodash');
const alexa = require('alexa-statemachine');

// Views are used by your controller to send responses to the user
const views = {
  LaunchIntent: { tell: 'Hello World!' },
}

// initialize the skill
const skill = new alexa.StateMachineSkill('appId', { views })

// respond to a LaunchIntent
skill.onIntent('LaunchIntent', (request) => {
  return { reply: 'LaunchIntent' };
});

// lambda handler
exports.handler = function handler(event, context, callback) {
  return skill.execute(event, context)
    .then(result => callback(null, result)
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
