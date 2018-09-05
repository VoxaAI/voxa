.. _voxa-platforms:


Voxa Platforms
==================

Voxa Platforms wrap your :js:class:`VoxaApp <VoxaApp>` and allow you to defined handlers for the different supported voice platforms.


.. js:class:: VoxaPlatform(voxaApp, config)

  :param VoxaApp voxaApp: The app
  :param config: The config


  .. js:method:: lambda()


    :returns: A lambda handler that will call the :js:func:`app.execute <VoxaApp.execute>` method

    .. code-block:: javascript

        exports.handler = alexaSkill.lambda();

  .. js:method:: lambdaHTTP()


    :returns: A lambda handler to use as an AWS API Gateway ProxyEvent handler that will call the :js:func:`app.execute <VoxaApp.execute>` method

    .. code-block:: javascript

        exports.handler = dialogFlowAction.lambdaHTTP();

  .. js:method:: azureFunction()


    :returns: An azure function handler

    .. code-block:: javascript

        module.exports = cortanaSkill.azureFunction();




.. _alexa-platform:

Alexa
-------

The Alexa Platform let's you use Voxa with Alexa

.. code-block:: javascript

  const { AlexaPlatform } = require('voxa');
  const { voxaApp } = require('./app');

  const alexaSkill = new AlexaPlatform(voxaApp);
  exports.handler = alexaSkill.lambda();



.. _dialogflow-platform:

DialogFlow
-------------

The DialogFlow Platform let's you use Voxa with DialogFlow

.. code-block:: javascript

  const { DialogFlowPlatform } = require('voxa');
  const { voxaApp } = require('./app');

  const dialogFlowAction = new DialogFlowPlatform(voxaApp);
  exports.handler = dialogFlowAction.lambdaHTTP();


.. _botframework-platform:

Botframework
------------------

The BotFramework Platform let's you use Voxa with Microsoft Botframework

.. code-block:: javascript

  const { BotFrameworkPlatform } = require('voxa');
  const { AzureBotStorage, AzureTableClient } = require('botbuilder-azure');
  const { voxaApp } = require('./app');
  const config = require('./config');

  const tableName = config.tableName;
  const storageKey = config.storageKey; // Obtain from Azure Portal
  const azureTableClient = new AzureTableClient(tableName, storageName, storageKey);
  const tableStorage = new AzureBotStorage({ gzipData: false }, azureTableClient);

  const botframeworkSkill = new BotFrameworkPlatform(app, {
    storage: tableStorage,
    recognizerURI: config.recognizerURI,
    applicationId: config.applicationId,
    applicationPassword: config.applicationPassword,
    defaultLocale: 'en',
  });

  module.exports = botframeworkSkill.azureFunction();
