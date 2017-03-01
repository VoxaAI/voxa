.. _plugins:

Plugins
=========

Plugins allow you to modify how the StateMachineSkill handles an alexa event. When a plugin is registered it will use the different hook points in your skill to add functionality. If you have several skills with similar behavior then your answer is to create a plugin.

Using a plugin
----------------------------

After instatiating a StateMachineSkill you can register plugins on it. Built in plugins can be accessed through ``alexa.plugins``

.. code-block:: javascript

    'use strict';
    const alexa = require('alexa-statemachine');
    const Model = require('./model');
    const views = require('./views'):
    const variables = require('./variables');

    const stateMachineSkill = new alexa.StateMachineSkill({ Model, variables, views });

    alexa.plugins.replaceIntent(stateMachineSkill);


State Flow plugin
------------------

Stores the state transitions for every alexa event in an array.

.. js:function:: stateFlow(skill)

  State Flow attaches callbacks to :js:func:`~StateMachineSkill.onRequestStarted`, :js:func:`~StateMachineSkill.onBeforeStateChanged` and :js:func:`~StateMachineSkill.onBeforeReplySent` to track state transitions in a ``alexaEvent.flow`` array

  :param StateMachineSkill skill: The skill object


Usage
******

.. code-block:: javascript

  const alexa = require('alexa-statemachine');
  alexa.plugins.stateFlow.register(skill)

  skill.onBeforeReplySent((alexaEvent) => {
    console.log(alexaEvent.flow.join(' > ')); // entry > firstState > secondState > die
  });



Replace intent plugin
----------------------

It allows you to rename an intent name based on a regular expression. By default it will match ``/(.*)OnlyIntent$/`` and replace it with ``$1Intent``.


.. js:function:: replaceIntent(skill, [config])
  
  Replace Intent plugin uses :js:func:`~StateMachineSkill.onIntentRequest` to modify the incomming request intent name

  :param object skill: The stateMachineSkill
  :param object config: An object with the ``regex`` to look for and the ``replace`` value.


Usage
******

.. code-block:: javascript

    const stateMachineSkill = new alexa.StateMachineSkill({ Model, variables, views });

    stateMachineSkill.plugins.replaceIntent(stateMachineSkill, { regex: /(.*)OnlyIntent$/, replace: '$1Intent' });
    stateMachineSkill.plugins.replaceIntent(stateMachineSkill, { regex: /^VeryLong(.*)/, replace: 'Long$1' });

Why onlyIntents?
*****************

A good practice is to isolate an utterance into another intent if it's contain a single slot. By creating the only intent, alexa will prioritize this intent if the user says only the slot.

Let's explain with the following scenario. You need the user to provide a zipcode.
so you should have an `intent` called ``ZipCodeIntent``. But you still have to manage if the user only says its zipcode with no other words on it. So that's when we create an OnlyIntent. Let's called ``ZipCodeOnlyIntent``.

Our utterance file will be like this: 

.. code-block:: text

    ZipCodeIntent here is my {ZipCodeSlot}
    ZipCodeIntent my zip is {ZipCodeSlot}
    ...

    ZipCodeOnlyIntent {ZipCodeSlot}


But now we have two states which are basically the same. Replace intent plugin will rename all incoming requests intents from ``ZipCodeOnlyIntent`` to ``ZipCodeIntent``.


Cloudwatch plugin
------------------

It logs a CloudWatch metric when the skill catches an error.

Params
******

.. js:function:: cloudwatch(skill, cloudwatch, [eventMetric])
  
  Cloudwatch plugin uses ``skill.onError`` to log a metric

  :param object skill: The stateMachineSkill
  :param object cloudwatch: A new `AWS.CloudWatch <http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#constructor-property/>`_ object. 
  :param object putMetricDataParams: Params for `putMetricData <http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property>`_


How to use it
**************

.. code-block:: javascript

    const AWS = require('aws-sdk');
    const stateMachineSkill = new alexa.StateMachineSkill({ Model, variables, views });

    const cloudwatch = new AWS.CloudWatch({});
    const eventMetric = { Namespace: 'fooBarSkill' };

    stateMachineSkill.plugins.cloudwatch(stateMachineSkill, cloudwatch, eventMetric);
