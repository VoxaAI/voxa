.. _voxa-reply:

The ``reply`` Object
====================

.. js:class:: IVoxaReply()

  The ``reply`` object is used by the framework to render voxa responses, it takes all of your ``statements``, ``cards`` and ``directives`` and generates a proper json response for each platform.

  .. js:function:: IVoxaReply.clear()

    Resets the response object

  .. js:function:: IVoxaReply.terminate()

    Sends a flag to indicate the session will be closed.

  .. js:function:: IVoxaReply.addStatement(statement, isPlain)

    Adds statements to the ``Reply``

    :param statement: The string to be spoken by the voice assistant
    :param isPlain: Indicates if the statement is plain text, if null, it means is SSML

  .. js:function:: IVoxaReply.addReprompt(statement, isPlain)

    Adds the reprompt text to the ``Reply``

    :param statement: The string to be spoken by the voice assistant as a reprompt
    :param isPlain: Indicates if the statement is plain text, if null, it means is SSML

  .. js:function:: IVoxaReply.hasDirective()

    Verifies if the reply has directives

    :returns: A boolean flag indicating if the reply object has any kind of directives

  .. js:function:: IVoxaReply.saveSession(event)

    Converts the model object into session attributes

    :param event: A Voxa event with session attributes


For the speceific classes used in every platform you can check:

- :ref:`AlexaReply <alexa-reply>`
