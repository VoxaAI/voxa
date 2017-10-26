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

Instantiating a StateMachineSkill requires a configuration specifying your :ref:`views-and-variables`.

.. code-block:: javascript

    'use strict';
    const Voxa = require('voxa');
    const views = require('./views'):
    const variables = require('./variables');

    const skill = new Voxa({ variables, views });

Responding to alexa events
-----------------------------

Once you have your skill configured responding to events is as simple as calling the :js:func:`skill.lambda <Voxa.lambda>` method

.. code-block:: javascript

  const skill = require('./MainStateMachine');

  exports.handler = skill.lambda();

Using the development server
-----------------------------

The framework provides a simple builtin server that's configured to serve all POST requests to your skill, this works great when developing, specially when paired with `ngrok <https://ngrok.com>`_

.. code-block:: javascript

  // this will start an http server listening on port 3000
  skill.startServer(3000);


Responding to an intent event
--------------------------------

.. code-block:: javascript

  skill.onIntent('HelpIntent', (voxaEvent) => {
    return { reply: 'HelpIntent.HelpAboutSkill' };
  });

  skill.onIntent('ExitIntent', (voxaEvent) => {
    return { reply: 'ExitIntent.Farewell' };
  });

Project Samples
----------------

To help you get started the state machine has a number of example projects you can use.

:ref:`Starter Kit <starter-kit>`
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is the simplest project, it defines the default directory structure we recommend using with voxa projects and has an example ``serverless.yml`` file that can be used to deploy your skill to a lambda function.

:ref:`My First Podcast <my-first-podcast>`
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In this example you will see how to implement a podcast skill by having a list of audios in a file (`podcast.js`) with titles and urls. It implements all audio intents allowed by the audio background feature and handles all the playback requests dispatched by Alexa once an audio has started, stopped, failed, finished or nearly to finish. Keep in mind the audios must be hosted in a secure server.

:ref:`Account Linking <account-linking>`
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

A more complex project that shows how to work with account linking and make responses using the model state. It uses serverless to deploy your account linking server and skill to lambda, create a dynamodb table to store your account linking and create an s3 bucket to store your static assets. It also has a gulp task to upload your assets to S3

Links
==================

* :ref:`search`

.. toctree::
  :maxdepth: 2
  :caption: Contents:

  glossary
  new-user
  mvc-description
  models
  views-and-variables
  controllers
  transition
  alexa-event
  reply
  statemachine-skill
  request-flow
  i18n
  plugins
  debugging
  starter-kit
  my-first-podcast
  account-linking
