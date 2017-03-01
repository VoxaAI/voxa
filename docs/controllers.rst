.. _controllers:

Controllers
=============

Controllers in your application control the logic of your skill, they respond to alexa alexaEvents, external resources, manipulate the input and give proper responses using your :ref:`Model <models>`, :ref:`views-and-variables`.

States come in one of two ways, they can be an object of mappings from intent name to state.

.. code-block:: javascript

  skill.onState('entry', {
    LaunchIntent: 'launch',
    'AMAZON.HelpIntent': 'help',
  });


Or they can be a function that gets a :ref:`alexaEvent <alexa-event>` object.

.. code-block:: javascript

  skill.onState('launch', (alexaEvent) => {
    return { reply: 'LaunchIntent.OpenResponse', to: 'die' };
  });

Your state should respond with a :ref:`transition <transition>`. The transition is a plain object that can take  ``directives``, ``to`` and ``reply`` keys.

The ``entry`` controller
--------------------------

The ``entry`` controller is special in that it's the default state to go to at the beginning of your session and if your state returns no response.

For example in the next snipped there's a ``waiting`` state that expects an ``AMAZON.NextIntent`` or an ``AMAZON.PreviousIntent``, in the case the users says something unexpected like an ``AMAZON.HelpIntent`` the state returns undefined, the State Machine framework handles this situations by redirecting to the ``entry`` state

.. code-block:: javascript

  skill.onState('waiting', (alexaEvent) => {
    if (alexaEvent.intent.name === 'AMAZON.NextIntent') {
      alexaEvent.model.index += 1;
      return { reply: 'Ingredients.Describe', to: 'waiting' }
    } else if (alexaEvent.intent.name === 'AMAZON.PreviousIntent') {
      alexaEvent.model.index -= 1;
      return { reply: 'Ingredients.Describe', to: 'waiting' }
    }
  });


The ``onIntent`` helper
-----------------------

For the simple pattern of having a controller respond to an specific intent the framework provides the ``onIntent`` helper

.. code-block:: javascript

  skill.onIntent('LaunchIntent', (alexaEvent) => {
    return { reply: 'LaunchIntent.OpenResponse', to: 'die' };
  });


Under the hood this creates a new key in the ``entry`` controller and a new state
