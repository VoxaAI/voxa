.. _alexa-event:

The ``AlexaEvent`` Object
===========================

.. js:class:: AlexaEvent(event, lambdaContext)

  The ``alexaEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: AlexaEvent.intent

    In Voxa the alexaEvent object makes ``intent.slots`` available through ``intent.params`` after aplying a simple transformation so ``{ slots: [{ name: 'Dish', value: 'Fried Chicken' }] }`` becomes ``{ Dish: 'Fried Chicken' }``, in other platforms it does it best to make the intent params for each platform also available on ``intent.params``

  .. js:attribute:: AlexaEvent.user

    A convenience getter to obtain the user from ``session.user`` or ``context.System.user`` in alexa, and ``conv.user.id`` in dialogflow. In other platforms it's also available, you can always count on the ``alexaEvent.user.userId`` being available. If there's an ``accessToken`` it will also be available through ``alexaEvent.user.accessToken``

  .. js:attribute:: AlexaEvent.token

    A convenience getter to obtain the request's token, specially when using the ``Display.ElementSelected``

  .. js:attribute:: AlexaEvent.requestToIntent

    An array of requests to be converted to intents to be used as ``app.toIntent`` in the app code.

  .. js:function:: AlexaEvent.supportedInterfaces()

    Array of supported interfaces

    :returns Array: A string array of the platform's supported interfaces
