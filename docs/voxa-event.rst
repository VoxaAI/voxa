.. _voxa-event:

The ``voxaEvent`` Object
===========================

.. js:class:: IVoxaEvent(event, lambdaContext)

  The ``voxaEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: VoxaEvent.model

    The default middleware instantiates a ``Model`` and makes it available through ``voxaEvent.model``

  .. js:attribute:: VoxaEvent.intent.params

    In Voxa the voxaEvent object makes ``intent.slots`` available through ``intent.params`` after aplying a simple transformation so


    .. code-block:: json

          { slots: [{ name: 'Dish', value: 'Fried Chicken' }] }
    ..

    becomes:

    .. code-block:: json

        { Dish: 'Fried Chicken' }
    ..

    in other platforms it does it best to make the intent params for each platform also available on ``intent.params``

  .. js:attribute:: VoxaEvent.user

    A convenience getter to obtain the user from ``session.user`` or ``context.System.user`` in alexa, and ``conv.user.id`` in dialogflow. In other platforms it's also available, you can always count on the ``voxaEvent.user.userId`` being available. If there's an ``accessToken`` it will also be available through ``voxaEvent.user.accessToken``

  .. js:attribute:: VoxaEvent.session

    A convenience getter to obtain the user from ``session.user`` or ``context.System.user`` in alexa, and ``conv.user.id`` in dialogflow. In other platforms it's also available, you can always count on the ``voxaEvent.user.userId`` being available. If there's an ``accessToken`` it will also be available through ``voxaEvent.user.accessToken``

  .. js:function:: VoxaEvent.supportedInterfaces()

    Array of supported interfaces

    :returns Array: A string array of the platform's supported interfaces

``IVoxaEvent`` is an interface that inherits its attributes and function to the specific platforms, for more information about each platform's own methods visit:

- :ref:`AlexaEvent <alexa-event>`
- :ref:`BotFrameworkEvent <botframework-event>`
- :ref:`DialogFlowEvent <dialogflow-event>`
