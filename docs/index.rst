.. voxa documentation master file, created by
   sphinx-quickstart on Tue Jan 24 15:18:17 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Voxa's documentation!
==============================================

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
Voxa is distributed via ``npm``

.. code-block:: bash

  $ npm install voxa --save

Initial Configuration
---------------------

Instantiating a Voxa Application requires a configuration specifying your :ref:`views-and-variables`.

.. code-block:: javascript

    const voxa = require('voxa');
    const views = require('./views'):
    const variables = require('./variables');

    const app = new voxa.VoxaApp({ variables, views });

Platforms
-------------

Once you have instantiated a platform it's time to create a plaform application. There are platform handlers for Alexa, DialogFlow and Botframework (Cortana);

.. code-block:: javascript

    const alexaSkill = new voxa.AlexaPlatform(app);
    const dialogFlowAction = new voxa.DialogFlowPlatform(app);

    // botframework requires some extra configuration like the Azure Table Storage to use and the Luis.ai endpoint
    const storageName = config.cortana.storageName;
    const tableName = config.cortana.tableName;
    const storageKey = config.cortana.storageKey; // Obtain from Azure Portal
    const azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);
    const tableStorage = new azure.AzureBotStorage({ gzipData: false }, azureTableClient);
    const botframeworkSkill = new voxa.BotFrameworkPlatform(app, {
      storage: tableStorage,
      recognizerURI: config.cortana.recognizerURI,
      applicationId: config.cortana.applicationId,
      applicationPassword: config.cortana.applicationPassword,
      defaultLocale: 'en',
    });



Using the development server
-----------------------------

The framework provides a simple builtin server that's configured to serve all POST requests to your skill, this works great when developing, specially when paired with `ngrok <https://ngrok.com>`_

.. code-block:: javascript

  // this will start an http server listening on port 3000
  alexaSkill.startServer(3000);


Responding to an intent event
--------------------------------

.. code-block:: javascript

  app.onIntent('HelpIntent', (voxaEvent) => {
    return { tell: 'HelpIntent.HelpAboutSkill' };
  });

  app.onIntent('ExitIntent', (voxaEvent) => {
    return { tell: 'ExitIntent.Farewell' };
  });

Responding to lambda requests
-----------------------------

Once you have your skill configured creating a lambda handler is as simple using the :js:func:`alexaSkill.lambda <VoxaPlatform.lambda>` method

.. code-block:: javascript

  exports.handler = alexaSkill.lambda();


Links
==================

* :ref:`search`

.. toctree::
  :maxdepth: 2
  :caption: Contents:

  new-alexa-user
  mvc-description
  models
  views-and-variables
  controllers
  transition
  voxa-event
  alexa-directives
  dialogflow-directives
  reply
  statemachine-skill
  request-flow
  i18n
  plugins
  debugging
