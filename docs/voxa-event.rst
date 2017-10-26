.. _alexa-event:

The ``voxaEvent`` Object
===========================

.. js:class:: AlexaEvent(event, lambdaContext)

  The ``voxaEvent`` object contains all the information from the Alexa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: AlexaEvent.model

    The default middleware instantiates a ``Model`` and makes it available through ``voxaEvent.model``

  .. js:attribute:: AlexaEvent.intent.params

    The voxaEvent object makes ``intent.slots`` available through ``intent.params`` after aplying a simple transformation so ``{ slots: [{ name: 'Dish', value: 'Fried Chicken' }] }`` becomes ``{ Dish: 'Fried Chicken' }``

  .. js:attribute:: AlexaEvent.user

    A convenience getter to obtain the user from ``sesssion.user`` or ``context.System.user``
