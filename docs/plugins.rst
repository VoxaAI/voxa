.. _plugins:

Plugins
=========

Plugins allow you to modify how the StateMachineSkill handles an alexa event. When a plugin is registered it will use the different hook points in your skill to add functionality. If you have several skills with similar behavior then your answer is to create a plugin.

Using a plugin
----------------------------

After instatiating a StateMachineSkill you can register plugins on it. Built in plugins can be accessed through ``Voxa.plugins``

.. code-block:: javascript

    'use strict';
    const Voxa = require('voxa');
    const Model = require('./model');
    const views = require('./views'):
    const variables = require('./variables');

    const skill = new Voxa({ Model, variables, views });

    Voxa.plugins.replaceIntent(skill);


State Flow plugin
------------------

Stores the state transitions for every alexa event in an array.

.. js:function:: stateFlow(skill)

  State Flow attaches callbacks to :js:func:`~Voxa.onRequestStarted`, :js:func:`~Voxa.onBeforeStateChanged` and :js:func:`~Voxa.onBeforeReplySent` to track state transitions in a ``alexaEvent.flow`` array

  :param Voxa skill: The skill object



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

  Replace Intent plugin uses :js:func:`~Voxa.onIntentRequest` to modify the incomming request intent name

  :param Voxa skill: The stateMachineSkill
  :param config: An object with the ``regex`` to look for and the ``replace`` value.


Usage
******

.. code-block:: javascript

    const skill = new Voxa({ Model, variables, views });

    Voxa.plugins.replaceIntent(skill, { regex: /(.*)OnlyIntent$/, replace: '$1Intent' });
    Voxa.plugins.replaceIntent(skill, { regex: /^VeryLong(.*)/, replace: 'Long$1' });

Why onlyIntents?
*****************

A good practice is to isolate an utterance into another intent if it contains a single slot. By creating the only intent, alexa will prioritize this intent if the user says only the slot.

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

It logs a CloudWatch metric when the skill catches an error or success execution.

Params
******

.. js:function:: cloudwatch(skill, cloudwatch, [eventMetric])

  Cloudwatch plugin uses :js:func:`Voxa.onError`, :js:func:`Voxa.onStateMachineError` and :js:func:`Voxa.onBeforeReplySent` to log metrics

  :param Voxa skill: The stateMachineSkill
  :param cloudwatch: A new `AWS.CloudWatch <http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#constructor-property/>`_ object.
  :param putMetricDataParams: Params for `putMetricData <http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property>`_


Usage
******

.. code-block:: javascript

    const AWS = require('aws-sdk');
    const skill = new Voxa({ Model, variables, views });

    const cloudWatch = new AWS.CloudWatch({});
    const eventMetric = {
      MetricName: 'Caught Error', // Name of your metric
      Namespace: 'SkillName' // Name of your skill
    };

    Voxa.plugins.cloudwatch(skill, cloudWatch, eventMetric);



Autoload plugin
------------------

It accepts an adapter to autoload info into the model object coming in every alexa request.

Params
******

.. js:function:: autoLoad(skill, [config])

  Autoload plugin uses ``skill.onSessionStarted`` to load data the first time user open a skill

  :param Voxa skill: The stateMachineSkill.
  :param config: An object with an ``adapter`` key with a `get` Promise method in which you can handle your database access to fetch information from any resource.


Usage
******

.. code-block:: javascript

    const skill = new Voxa({ Model, variables, views });

    Voxa.plugins.autoLoad(skill, { adapter });
