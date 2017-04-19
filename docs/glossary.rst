===================
Voxa Documentation!
===================

-------
Summary
-------
Voxa is an Alexa skill framework that provides a way to organize a skill into a state machine. Even the most complex voice user interface (VUI) can be represented through the state machine and it provides the flexibility needed to both be rigid when needed in specific states and flexible to jump around when allowing that also makes sense.  

----------------------------
Why Voxa vs other frameworks
----------------------------
Voxa provides a more robust framework for building Alexa skills.  It provides a design pattern that wasn’t found in other frameworks.   Critical to Voxa was providing a pluggable interface and supporting all of the latest ASK features.  

--------
Features
--------
* MVC Pattern
* State or Intent handling (State Machine)
* Easy integration with several Analytics providers
* Easy to modify response file (the view)
* Compatibility with all SSML features
* Compatible with Audio directives
* Works with companion app cards
* Supports i18n in the responses
* Clean code structure with a unit testing framework
* Easy error handling
* Account linking support
* Persistent session support using DynamoDB
* Several Plugins

-------------
Installation
-------------
Voxa is distributed via ``npm``

.. code-block:: bash

  $ npm install voxa --save

---------------------
Initial Configuration
---------------------

Instantiating a StateMachineSkill requires a configuration specifying your :ref:`views-and-variables`.

.. code-block:: javascript

    'use strict';
    const Voxa = require('voxa');
    const views = require('./views'):
    const variables = require('./variables');

    const skill = new Voxa({ variables, views });

--------------------------
Responding to alexa events
--------------------------

Once you have your skill configured responding to events is as simple as calling the :js:func:`skill.lambda <Voxa.lambda>` method

.. code-block:: javascript

  const skill = require('./MainStateMachine');

  exports.handler = skill.lambda();

----------------------------
Using the development server
----------------------------

The framework provides a simple builtin server that's configured to serve all POST requests to your skill, this works great when developing, specially when paired with `ngrok <https://ngrok.com>`_

.. code-block:: javascript

  // this will start an http server listening on port 3000
  skill.startServer(3000);

-----------------------------
Responding to an intent event
-----------------------------

.. code-block:: javascript

  skill.onIntent('HelpIntent', (alexaEvent) => {
    return { reply: 'HelpIntent.HelpAboutSkill' };
  });

  skill.onIntent('ExitIntent', (alexaEvent) => {
    return { reply: 'ExitIntent.Farewell' };
  });
