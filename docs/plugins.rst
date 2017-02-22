.. _plugins:

Plugins
=========

Plugins allow you to modify how the StateMachineSkill handles a request. When a plugin is registered it will use the different hook points in your skill to add functionality. If you have several skills with similar behavior then your answer is to create a plugin.

Using a plugin
----------------------------

After instatiating a StateMachineSkill you can register plugins on it. Built in plugins can be accessed through ``alexa.plugins``

.. code-block:: javascript

    'use strict';
    const alexa = require('alexa-statemachine');
    const Model = require('./model');
    const views = require('./views'):
    const variables = require('./variables');

    const stateMachineSkill = new alexa.StateMachineSkill('appId', { 
      Model, 
      variables, 
      views,
    });

    alexa.plugins.replaceIntent(stateMachineSkill);


Replace intent plugin
----------------------

It allows you to rename an intent name based on a regular expression. By default it will match ``/(.*)OnlyIntent$/`` and replace it with ``$1Intent``.


Params
******


.. js:function:: replaceIntent(skill, [config])
  
  Replace Intent plugin uses ``skill.onIntentRequest`` to modify the incomming request intent name

  :param object skill: The stateMachineSkill
  :param object config: An object with the ``regex`` to look for and the ``replace`` value.


How to use it
*************

.. code-block:: javascript

    const stateMachineSkill = new alexa.StateMachineSkill('appId', { 
      Model, 
      variables, 
      views,
    });

    stateMachineSkill.plugins.replaceIntent(stateMachineSkill, { regex: /(.*)OnlyIntent$/, replace: '$1Intent' });
    stateMachineSkill.plugins.replaceIntent(stateMachineSkill, { regex: /^VeryLong(.*)/, replace: 'Long$1' });

Why onlyIntents?
*****************

A good practice is to isolate an utterance into another intent if it's contain a single slot. By creating the only intent, alexa will prioritize this intent if the user says only the slot.

Let's explain with the following scenario. You need the user to provide a zipcode.
so you should have an `intent` called ``ZipCodeIntent``. But you still have to manage if the user only says its zipcode with no other words on it. So that's when we create an OnlyIntent. Let's called ``ZipCodeOnlyIntent``.

Our utterance file will be like this: 

.. code-block:: txt

    ZipCodeIntent here is my {ZipCodeSlot}
    ZipCodeIntent my zip is {ZipCodeSlot}
    ...

    ZipCodeOnlyIntent {ZipCodeSlot}


But now we have two states which are basically the same. Replace intent plugin will rename all incoming requests intents from ``ZipCodeOnlyIntent`` to ``ZipCodeIntent``.
