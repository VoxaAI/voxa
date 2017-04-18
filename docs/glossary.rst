===================
Voxa Documentation!
===================

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
