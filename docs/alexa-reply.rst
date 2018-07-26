.. _alexa-reply:

The ``reply`` Object
====================


.. js:class:: AlexaReply()

  The ``reply`` object is used by the framework to render Alexa responses, it takes all of your ``statements``, ``cards`` and ``directives`` and generates a proper json response for Alexa

  .. js:function:: Reply.fulfillIntent(canFulfill)

    Fulfills the request in the response object

    :param canFulfill: A string with possible values: YES | NO | MAYBE to fulfill request

  .. js:function:: Reply.fulfillSlot(slotName, canUnderstand, canFulfill)

    Fulfills the slot with fulfill and understand values

    :param slotName: A string with the slot to fulfill
    :param canUnderstand: A string with possible values: YES | NO | MAYBE that indicates slot understanding
    :param canFulfill: A string with possible values: YES | NO that indicates slot fulfillment
