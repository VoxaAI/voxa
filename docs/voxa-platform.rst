.. _voxa-platforms:


Voxa Platforms
==================


.. js:class:: VoxaPlatform(voxaApp, config)

  :param VoxaApp voxaApp: The app
  :param config: The config


.. js:function:: VoxaPlatform.lambda()


  :returns: A lambda handler that will call the :js:func:`app.execute <VoxaApp.execute>` method

  .. code-block:: javascript

      exports.handler = app.lambda();

.. js:function:: VoxaPlatform.lambdaHTTP()


  :returns: A lambda handler to use with as an AWS API Gateway ProxyEvent handler that will call the :js:func:`app.execute <VoxaApp.execute>` method

  .. code-block:: javascript

      exports.handler = app.lambdaHTTP();

