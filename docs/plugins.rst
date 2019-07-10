.. _plugins:

Plugins
=========

Plugins allow you to modify how the StateMachineSkill handles an alexa event. When a plugin is registered it will use the different hooks in your skill to add functionality. If you have several skills with similar behavior then your answer is to create a plugin.

Using a plugin
----------------------------

After instantiating a StateMachineSkill you can register plugins on it. Built in plugins can be accessed through ``Voxa.plugins``

.. code-block:: javascript

    'use strict';
    const { VoxaApp, plugins } = require('voxa');
    const Model = require('./model');
    const views = require('./views'):
    const variables = require('./variables');

    const app = new VoxaApp({ Model, variables, views });

    plugins.replaceIntent(app);


State Flow plugin
------------------

Stores the state transitions for every alexa event in an array.

.. js:function:: stateFlow(app)

  State Flow attaches callbacks to :js:func:`~VoxaApp.onRequestStarted`, :js:func:`~VoxaApp.onBeforeStateChanged` and :js:func:`~VoxaApp.onBeforeReplySent` to track state transitions in a ``voxaEvent.flow`` array

  :param VoxaApp app: The app object



Usage
******

.. code-block:: javascript

  const alexa = require('alexa-statemachine');
  alexa.plugins.stateFlow.register(app)

  app.onBeforeReplySent((voxaEvent) => {
    console.log(voxaEvent.flow.join(' > ')); // entry > firstState > secondState > die
  });



Replace Intent plugin
----------------------

It allows you to rename an intent name based on a regular expression. By default it will match ``/(.*)OnlyIntent$/`` and replace it with ``$1Intent``.


.. js:function:: replaceIntent(app, [config])

  Replace Intent plugin uses :js:func:`~VoxaApp.onIntentRequest` to modify the incoming request intent name

  :param VoxaApp app: The stateMachineSkill
  :param config: An object with the ``regex`` to look for and the ``replace`` value.


Usage
******

.. code-block:: javascript

    const app = new Voxa({ Model, variables, views });

    Voxa.plugins.replaceIntent(app, { regex: /(.*)OnlyIntent$/, replace: '$1Intent' });
    Voxa.plugins.replaceIntent(app, { regex: /^VeryLong(.*)/, replace: 'Long$1' });

Why OnlyIntents?
*****************

A good practice is to isolate an utterance into another intent if it contains a single slot. By creating the OnlyIntent, Alexa will prioritize this intent if the user says only a value from that slot.

Let's explain with the following scenario. You need the user to provide a zipcode.
You would have an `intent` called ``ZipCodeIntent``. But you still have to manage if the user only says a zipcode without any other words. So that's when we create an OnlyIntent. Let's call it ``ZipCodeOnlyIntent``.

Our utterance file will be like this:

.. code-block:: text

    ZipCodeIntent here is my {ZipCodeSlot}
    ZipCodeIntent my zip is {ZipCodeSlot}
    ...

    ZipCodeOnlyIntent {ZipCodeSlot}


But now we have two states which are basically the same. Replace Intent plugin will rename all incoming requests intents from ``ZipCodeOnlyIntent`` to ``ZipCodeIntent``.


CloudWatch plugin
------------------

It logs a CloudWatch metric when the skill catches an error or success execution.

Params
******

.. js:function:: cloudwatch(app, cloudwatch, [eventMetric])

  CloudWatch plugin uses :js:func:`VoxaApp.onError` and :js:func:`VoxaApp.onBeforeReplySent` to log metrics

  :param VoxaApp app: The stateMachineSkill
  :param cloudwatch: A new `AWS.CloudWatch <http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#constructor-property/>`_ object.
  :param putMetricDataParams: Params for `putMetricData <http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property>`_


Usage
******

.. code-block:: javascript

    const AWS = require('aws-sdk');
    const app = new Voxa({ Model, variables, views });

    const cloudWatch = new AWS.CloudWatch({});
    const eventMetric = {
      MetricName: 'Caught Error', // Name of your metric
      Namespace: 'SkillName' // Name of your skill
    };

    Voxa.plugins.cloudwatch(app, cloudWatch, eventMetric);



Autoload plugin
------------------

It accepts an adapter to autoload info into the model object coming in every alexa request.

Params
******

.. js:function:: autoLoad(app, [config])

  Autoload plugin uses ``app.onSessionStarted`` to load data the first time the user opens a skill

  :param VoxaApp app: The stateMachineSkill.
  :param config: An object with an ``adapter`` key with a `get` Promise method in which you can handle your database access to fetch information from any resource.


Usage
******

.. code-block:: javascript

    const app = new VoxaApp({ Model, variables, views });

    plugins.autoLoad(app, { adapter });




S3Persistence plugin
--------------------

It stores the user's session attributes in a file in an S3 bucket.

Params
******

.. js:function:: s3Persistence(app, [config])

  S3Persistence plugin uses ``app.onRequestStarted`` to load data every time the user sends a request to the skill
  S3Persistence plugin uses ``app.onBeforeReplySent`` to store the user's session data before sending a response back to the skill

  :param VoxaApp app: The stateMachineSkill.
  :param config: An object with a ``bucketName`` key for the S3 bucket to store the info. A ``pathPrefix`` key in case you want to store this info in a folder. An ``aws`` key if you want to initialize the S3 object with specific values, and an ``s3Client`` key, in case you want to provide an S3 object already initialized.


Usage
******

.. code-block:: javascript

    const app = new VoxaApp({ Model, variables, views });

    const s3PersistenceConfig = {
      bucketName: 'MY_S3_BUCKET',
      pathPrefix: 'userSessions',
    };

    plugins.s3Persistence(app, s3PersistenceConfig);
