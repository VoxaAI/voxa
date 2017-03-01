.. _reply:

The ``reply`` Object
====================


.. js:class:: Reply(alexaEvent, [message])

  The ``reply`` object is used by the framework to render Alexa responses, it takes all of your ``statements``, ``cards`` and ``directives`` and generates a proper json response for Alexa

  :param AlexaEvent alexaEvent:
  :param message: A message object

  .. js:function:: Reply.append(message)
    
    Adds statements to the ``Reply``
    
    :param message: An object with keys ``ask``, ``tell``, ``say``, ``reprompt``, ``card`` or ``directives`` keys. Or another ``reply`` object
    :returns: the ``Reply`` object

  .. js:function:: Reply.toJSON()
    
    :returns: An object with the proper format to send back to Alexa, with statements wrapped in SSML tags, cards, reprompts and directives
