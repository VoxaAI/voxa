.. alexa-statemachine documentation master file, created by
   sphinx-quickstart on Tue Jan 24 15:18:17 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to alexa-statemachine's documentation!
==============================================

.. toctree::
  :maxdepth: 2
  :caption: Contents:

  models
  views
  controllers
  variables
  request
  request-flow
  middleware
  debugging

Installation
-------------
Alexa State Machine is distributed via ``npm``

.. code-block:: bash

  npm install alexa-statemachine --save

Initial Configuration
---------------------

Instantiating a StateMachineSkill requires an applicationId, :ref:`views` , :ref:`variables` and a :ref:`Model <models>`.

.. code-block:: javascript

    const alexa = require('alexa-statemachine');
    const Model = require('./model');
    const responses = require('./responses'):
    const variables = require('./variables');

    const stateMachineSkill = new alexa.StateMachineSkill('appId', { 
      Model, 
      variables, 
      views,
    });

Responding to event requests
-----------------------------

Once you have your skill configured responding to events is as simple as calling the ``skill.execute`` method

.. code-block:: javascript

  'use strict';
  const skill = require('./MainStateMachine');

  exports.handler = function handler(event, context) {
    skill.execute(event, context)
      .then(context.succeed)
      .catch(context.fail);
  };


Links
==================

* :ref:`search`
