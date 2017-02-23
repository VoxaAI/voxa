.. alexa-statemachine documentation master file, created by
   sphinx-quickstart on Tue Jan 24 15:18:17 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to alexa-statemachine's documentation!
==============================================

Installation
-------------
Alexa State Machine is distributed via ``npm``

.. code-block:: bash

  $ npm install alexa-statemachine --save

Initial Configuration
---------------------

Instantiating a StateMachineSkill requires an applicationId, :ref:`views-and-variables`, and a :ref:`Model <models>`.

.. code-block:: javascript

    'use strict';
    const alexa = require('alexa-statemachine');
    const Model = require('./model');
    const views = require('./views'):
    const variables = require('./variables');

    const stateMachineSkill = new alexa.StateMachineSkill('appId', { Model, variables, views });

Responding to alexa requests
-----------------------------

Once you have your skill configured responding to events is as simple as calling the :js:func:`skill.execute <StateMachineSkill.execute>` method

.. code-block:: javascript

  const skill = require('./MainStateMachine');

  exports.handler = function handler(event, context) {
    skill.execute(event, context)
      .then(context.succeed)
      .catch(context.fail);
  };

Responding to an intent request
--------------------------------

.. code-block:: javascript

  skill.onIntent('HelpIntent', (request) => {
    return { reply: 'HelpIntent.HelpAboutSkill' };
  });

  skill.onIntent('ExitIntent', (request) => {
    return { reply: 'ExitIntent.Farewell' };
  });

Project Samples
----------------

To help you get started the state machine has a number of example projects you can use.

:ref:`Starter Kit <starter-kit>`
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is the simplest project, it defines the default directory structure we recommend using with alexa-statemachine projects and has an example ``serverless.yml`` file that can be used to deploy your skill to a lambda function.

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

  models
  views-and-variables
  controllers
  transition
  request
  reply
  statemachine-skill
  request-flow
  i18n
  plugins
  debugging
  starter-kit
  my-first-podcast
  account-linking

