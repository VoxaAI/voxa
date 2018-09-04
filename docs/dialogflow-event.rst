.. _dialogflow-event:

The ``DialogFlowEvent`` Object
==============================

.. js:class:: DialogFlowEvent(event, lambdaContext)

  The ``dialogFlowEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: DialogFlowEvent.conv

    The conversation instance that contains the raw input sent by Dialogflow

  .. js:attribute:: DialogFlowEvent.intent

    In Voxa the dialogFlowEvent object makes ``intent.slots`` available through ``intent.params`` after aplying a simple transformation so ``{ slots: [{ name: 'Dish', value: 'Fried Chicken' }] }`` becomes ``{ Dish: 'Fried Chicken' }``, in other platforms it does it best to make the intent params for each platform also available on ``intent.params``

  .. js:attribute:: DialogFlowEvent.user

    A convenience getter to obtain the user from ``session.user`` or ``context.System.user`` in alexa, and ``conv.user.id`` in dialogflow. In other platforms it's also available, you can always count on the ``dialogFlowEvent.user.userId`` being available. If there's an ``accessToken`` it will also be available through ``dialogFlowEvent.user.accessToken``

  .. js:function:: DialogFlowEvent.supportedInterfaces()

    Array of supported interfaces

    :returns Array: A string array of the platform's supported interfaces
