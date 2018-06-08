.. _controllers:

Controllers
=============

Controllers in your application control the logic of your skill, they respond to alexa voxaEvents, external resources, manipulate the input and give proper responses using your :ref:`Model <models>`, :ref:`views-and-variables`.

States come in one of two ways, they can be an object of mappings from intent name to state.

.. code-block:: javascript

  skill.onState('entry', {
    LaunchIntent: 'launch',
    'AMAZON.HelpIntent': 'help',
  });


Or they can be a function that gets a :ref:`voxaEvent <voxa-event>` object.

.. code-block:: javascript

  skill.onState('launch', (voxaEvent) => {
    return { tell: 'LaunchIntent.OpenResponse' };
  });

Your state should respond with a :ref:`transition <transition>`. The transition is a plain object that can take  ``directives``, ``to`` and ``flow`` keys.

The ``entry`` controller
--------------------------

The ``entry`` controller is special in that it's the default state to go to at the beginning of your session and if your state returns no response.

For example in the next snipped there's a ``waiting`` state that expects an ``AMAZON.NextIntent`` or an ``AMAZON.PreviousIntent``, in the case the users says something unexpected like an ``AMAZON.HelpIntent`` the state returns undefined, the State Machine framework handles this situations by redirecting to the ``entry`` state

.. code-block:: javascript

  skill.onState('waiting', (voxaEvent) => {
    if (voxaEvent.intent.name === 'AMAZON.NextIntent') {
      voxaEvent.model.index += 1;
      return { ask: 'Ingredients.Describe', to: 'waiting' }
    } else if (voxaEvent.intent.name === 'AMAZON.PreviousIntent') {
      voxaEvent.model.index -= 1;
      return { ask: 'Ingredients.Describe', to: 'waiting' }
    }
  });


The ``onIntent`` helper
-----------------------

For the simple pattern of having a controller respond to an specific intent the framework provides the ``onIntent`` helper

.. code-block:: javascript

  skill.onIntent('LaunchIntent', (voxaEvent) => {
    return { tell: 'LaunchIntent.OpenResponse' };
  });

If you receive a Display.ElementSelected type request, you could use the same approach for intents and state. Voxa receives this type of request and turns it into ``DisplayElementSelected`` Intent

.. code-block:: javascript

  skill.onIntent('DisplayElementSelected', (voxaEvent) => {
    return { tell: 'DisplayElementSelected.OpenResponse' };
  });


Under the hood this creates a new key in the ``entry`` controller and a new state
